import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAID_MODELS = ['claude-sonnet-4-5', 'claude-sonnet-4-6'];
const CREDIT_COST = 1;

// Aantal gratis scans dat een niet-ingelogde bezoeker per IP per 24u mag doen.
const ANON_FREE_SCANS = 1;

// Haalt het client-IP uit de request headers (Vercel zet x-forwarded-for).
const getClientIp = (request) => {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
};

// LAAG 1 — URL patroon validatie per platform (alleen voor secondhand marktplaatsen)
const URL_PATTERNS = {
  'ebay':          [/ebay\.(com|nl|de|fr|co\.uk|es|it)\/itm\/\d+/, /ebay\.(com|nl|de|fr|co\.uk|es|it)\/p\//],
  'vinted':        [/vinted\.(nl|fr|de|be|com|es|it|pl|co\.uk)\/items\/\d+/],
  'marktplaats':   [/marktplaats\.nl\/[av]\//],
  'grailed':       [/grailed\.com\/listings\/\d+/],
  'depop':         [/depop\.com\/products\//],
  'vestiaire':     [/vestiairecollective\.com\/.+-\d+\.shtml/, /vestiairecollective\.com\/.+-p\d+/],
  'kleinanzeigen': [/kleinanzeigen\.de\/s-anzeige\//],
};

const getFallbackUrl = (platform, query) => {
  const q = encodeURIComponent(query || '');
  const p = (platform || '').toLowerCase();
  if (p.includes('vinted'))        return `https://www.vinted.nl/catalog?search_text=${q}`;
  if (p.includes('marktplaats'))   return `https://www.marktplaats.nl/q/${q}`;
  if (p.includes('ebay'))          return `https://www.ebay.nl/sch/i.html?_nkw=${q}`;
  if (p.includes('grailed'))       return `https://www.grailed.com/shop/listings?query=${q}`;
  if (p.includes('depop'))         return `https://www.depop.com/search/?q=${q}`;
  if (p.includes('vestiaire'))     return `https://www.vestiairecollective.com/search/?q=${q}`;
  if (p.includes('kleinanzeigen')) return `https://www.kleinanzeigen.de/s-suchanfrage.html?keywords=${q}`;
  return `https://www.google.com/search?q=${q}`;
};

const isValidPattern = (url, platform) => {
  if (!url || !url.startsWith('http')) return false;
  const p = (platform || '').toLowerCase();
  for (const [key, patterns] of Object.entries(URL_PATTERNS)) {
    if (p.includes(key)) return patterns.some(regex => regex.test(url));
  }
  return true; // onbekend/retail platform — vertrouw de URL, geen patroon-check
};

// LAAG 2 — HEAD check, maar alleen vervangen bij ECHT dode pagina's (404/410).
// Retailers blokkeren bots vaak met 403/405 — dat is GEEN dode pagina, dus behouden.
const isUrlDead = async (url) => {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(3500) });
    return r.status === 404 || r.status === 410;
  } catch {
    return false; // timeout/netwerkfout — niet als dood beschouwen
  }
};

const validateListings = async (listings, searchQuery) => {
  if (!listings?.length) return listings;
  return await Promise.all(listings.map(async (listing) => {
    const url = listing.url;
    // Laag 1: alleen patroon checken voor bekende secondhand platforms
    if (!isValidPattern(url, listing.platform)) {
      listing.url = getFallbackUrl(listing.platform, searchQuery);
      listing._url_fallback = 'pattern';
      return listing;
    }
    // Laag 2: alleen vervangen bij 404/410
    const dead = await isUrlDead(url);
    if (dead) {
      listing.url = getFallbackUrl(listing.platform, searchQuery);
      listing._url_fallback = 'dead';
    }
    return listing;
  }));
};

const injectValidatedListings = (data, validatedListings) => {
  const newContent = (data.content || []).map(block => {
    if (block.type !== 'text') return block;
    try {
      const parsed = JSON.parse(block.text);
      if (parsed?.listings) return { ...block, text: JSON.stringify({ ...parsed, listings: validatedListings }) };
    } catch {}
    const match = block.text.match(/\{[\s\S]*"listings"[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed?.listings) {
          const replaced = block.text.replace(match[0], JSON.stringify({ ...parsed, listings: validatedListings }));
          return { ...block, text: replaced };
        }
      } catch {}
    }
    return block;
  });
  return { ...data, content: newContent };
};

const SYSTEM_TEXT = "You are Gemly, an expert AI shopping assistant specializing in fashion, sneakers, luxury goods, and vintage items. You help users find the best deals on secondhand and new items across platforms like eBay, Vinted, Grailed, StockX, Vestiaire Collective, Depop, and Marktplaats, as well as official retail webshops for brand new items. Always return valid JSON only, no markdown, no explanation. Only return real URLs from search results.";

const ANTHROPIC_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": process.env.ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-beta": "web-search-2025-03-05,prompt-caching-2024-07-31",
};

export async function POST(request) {
  try {
    const body = await request.json();
    // is_retry wordt hier OOK uit de body gehaald zodat hij nooit naar Anthropic lekt.
    const { is_listing_search, is_retry, search_query, scan_condition, scan_category, ...anthropicBody } = body;

    const isPaidCall = PAID_MODELS.includes(anthropicBody.model) && anthropicBody.tools?.length > 0;

    // Alleen de ECHTE hoofdscan kost een credit. Retry en shop-call horen bij
    // dezelfde scan en zijn gratis.
    const isMainScan = is_listing_search && !is_retry;

    if (isPaidCall) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { cookies: { getAll: () => cookieStore.getAll() } }
      );

      const { data: { user } } = await supabase.auth.getUser();

      // ---------------------------------------------------------------
      // ANONIEME BEZOEKER (geen account): 1 gratis scan per IP per 24u.
      // Raakt credits / profiles / auth-trigger NIET aan.
      // ---------------------------------------------------------------
      if (!user) {
        const ip = getClientIp(request);

        if (isMainScan) {
          // Hoofdscan: tel hoeveel gratis scans dit IP in de laatste 24u deed.
          const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count } = await supabase
            .from('anon_scans')
            .select('id', { count: 'exact', head: true })
            .eq('ip', ip)
            .gte('scanned_at', since24h);
          if ((count || 0) >= ANON_FREE_SCANS) {
            return Response.json(
              { error: 'signup_required', message: 'Create a free account to keep scanning.' },
              { status: 403 }
            );
          }
        } else {
          // Retry- of shop-call: alleen toegestaan als onderdeel van een net
          // gestarte gratis scan vanaf dit IP (voorkomt directe endpoint-misbruik).
          const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString();
          const { count: recent } = await supabase
            .from('anon_scans')
            .select('id', { count: 'exact', head: true })
            .eq('ip', ip)
            .gte('scanned_at', since10m);
          if ((recent || 0) < 1) {
            return Response.json(
              { error: 'signup_required', message: 'Create a free account to keep scanning.' },
              { status: 403 }
            );
          }
        }

        if (!anthropicBody.system && anthropicBody.messages?.length > 0) {
          anthropicBody.system = [{ type: "text", text: SYSTEM_TEXT, cache_control: { type: "ephemeral" } }];
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: ANTHROPIC_HEADERS,
          body: JSON.stringify(anthropicBody),
        });

        let data = await response.json();

        if (response.ok && !data.error) {
          if (is_listing_search) {
            const textBlock = (data.content || []).find(b => b.type === 'text');
            if (textBlock) {
              try {
                const text = textBlock.text;
                const match = text.match(/\{[\s\S]*"listings"[\s\S]*\}/);
                const parsed = match ? JSON.parse(match[0]) : JSON.parse(text);
                if (parsed?.listings?.length) {
                  const validated = await validateListings(parsed.listings, search_query || '');
                  data = injectValidatedListings(data, validated);
                }
              } catch {}
            }
          }
          // Pas NA een geslaagde hoofdscan de gratis-scan teller bijwerken.
          if (isMainScan) {
            await supabase.from('anon_scans').insert({ ip });
          }
        }

        return Response.json(data, { status: response.status });
      }

      // ---------------------------------------------------------------
      // INGELOGDE GEBRUIKER.
      // ---------------------------------------------------------------
      const { data: profile, error: profileError } = await supabase
       .from('profiles').select('credits, total_searches').eq('id', user.id).single();

      if (profileError || !profile) {
        return Response.json({ error: 'profile_error', message: 'Could not load your profile.' }, { status: 500 });
      }
      // Alleen de hoofdscan vereist credits; retry en shop-call zijn gratis.
      if (isMainScan && profile.credits < CREDIT_COST) {
        return Response.json({ error: 'no_credits', message: 'You have no searches left.', credits: 0 }, { status: 402 });
      }

      if (!anthropicBody.system && anthropicBody.messages?.length > 0) {
        anthropicBody.system = [{ type: "text", text: SYSTEM_TEXT, cache_control: { type: "ephemeral" } }];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify(anthropicBody),
      });

      let data = await response.json();

      if (response.ok && !data.error) {
        if (is_listing_search) {
          const textBlock = (data.content || []).find(b => b.type === 'text');
          if (textBlock) {
            try {
              const text = textBlock.text;
              const match = text.match(/\{[\s\S]*"listings"[\s\S]*\}/);
              const parsed = match ? JSON.parse(match[0]) : JSON.parse(text);
              if (parsed?.listings?.length) {
                const validated = await validateListings(parsed.listings, search_query || '');
                data = injectValidatedListings(data, validated);
              }
            } catch {}
          }
        }

        // Credit aftrekken + scan loggen: UITSLUITEND bij de echte hoofdscan.
        // Retry en shop-call kosten niets en worden niet dubbel gelogd.
        if (isMainScan) {
          await supabase.from('profiles').update({
            credits: profile.credits - CREDIT_COST,
            total_searches: (profile.total_searches || 0) + 1
          }).eq('id', user.id);

          if (search_query) {
            supabase.from('scan_logs').insert({
              user_id: user.id,
              query: search_query,
              condition: scan_condition || null,
              category: scan_category || null,
            }).then(() => {}, () => {});
          }

          data._credits_remaining = profile.credits - CREDIT_COST;
        } else {
          data._credits_remaining = profile.credits;
        }
      }

      return Response.json(data, { status: response.status });
    }

    // Free calls
    if (!anthropicBody.system && anthropicBody.messages?.length > 0) {
      anthropicBody.system = [{ type: "text", text: SYSTEM_TEXT, cache_control: { type: "ephemeral" } }];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: ANTHROPIC_HEADERS,
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
