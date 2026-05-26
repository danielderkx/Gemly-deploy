import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAID_MODELS = ['claude-sonnet-4-5', 'claude-sonnet-4-6'];
const CREDIT_COST = 1;

// LAAG 1 — URL patroon validatie per platform
const URL_PATTERNS = {
  'ebay':       [/ebay\.(com|nl|de|fr|co\.uk)\/itm\/\d+/, /ebay\.(com|nl|de|fr|co\.uk)\/p\//],
  'vinted':     [/vinted\.(nl|fr|de|be|com)\/items\/\d+/],
  'marktplaats':[/marktplaats\.nl\/a\/[^/]+\/[^/]+\/a\d+/],
  'grailed':    [/grailed\.com\/listings\/\d+/],
  'depop':      [/depop\.com\/products\//],
  'vestiaire':  [/vestiairecollective\.com\/[^/]+-p\d+/],
  'kleinanzeigen': [/kleinanzeigen\.de\/[^/]+\/anzeige\//],
  'stockx':     [/stockx\.com\/[^/]+-[a-z0-9-]+$/],
  'catawiki':   [/catawiki\.com\/[a-z]+\/lots\//],
};

const getFallbackUrl = (platform, query) => {
  const q = encodeURIComponent(query || '');
  const p = (platform || '').toLowerCase();
  if (p.includes('vinted'))      return `https://www.vinted.nl/catalog?search_text=${q}`;
  if (p.includes('marktplaats')) return `https://www.marktplaats.nl/q/${q}`;
  if (p.includes('ebay'))        return `https://www.ebay.nl/sch/i.html?_nkw=${q}`;
  if (p.includes('grailed'))     return `https://www.grailed.com/shop/listings?query=${q}`;
  if (p.includes('depop'))       return `https://www.depop.com/search/?q=${q}`;
  if (p.includes('vestiaire'))   return `https://www.vestiairecollective.com/search/?q=${q}`;
  if (p.includes('kleinanzeigen')) return `https://www.kleinanzeigen.de/s/${q}`;
  if (p.includes('stockx'))      return `https://stockx.com/search?s=${q}`;
  return `https://www.google.com/search?q=${q}+kopen+tweedehands`;
};

const isValidPattern = (url, platform) => {
  if (!url || !url.startsWith('http')) return false;
  const p = (platform || '').toLowerCase();
  for (const [key, patterns] of Object.entries(URL_PATTERNS)) {
    if (p.includes(key)) {
      return patterns.some(regex => regex.test(url));
    }
  }
  return true; // onbekend platform, vertrouw het
};

// LAAG 2 — HEAD request check
const isUrlAlive = async (url) => {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(3000),
    });
    return r.ok; // true bij 200-299
  } catch {
    return false;
  }
};

const validateListings = async (listings, searchQuery) => {
  if (!listings?.length) return listings;
  return await Promise.all(listings.map(async (listing) => {
    const url = listing.url;

    // Laag 1: patroon check
    if (!isValidPattern(url, listing.platform)) {
      listing.url = getFallbackUrl(listing.platform, searchQuery);
      listing._url_fallback = 'pattern';
      return listing;
    }

    // Laag 2: HEAD check
    const alive = await isUrlAlive(url);
    if (!alive) {
      listing.url = getFallbackUrl(listing.platform, searchQuery);
      listing._url_fallback = 'dead';
    }

    return listing;
  }));
};

const injectValidatedListings = (data, validatedListings) => {
  // Vervang de listings JSON in de text content van de response
  const newContent = (data.content || []).map(block => {
    if (block.type !== 'text') return block;
    try {
      const parsed = JSON.parse(block.text);
      if (parsed?.listings) {
        return { ...block, text: JSON.stringify({ ...parsed, listings: validatedListings }) };
      }
    } catch {}
    // Probeer JSON uit tekst te halen
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { is_listing_search, search_query, ...anthropicBody } = body;

    const isPaidCall = PAID_MODELS.includes(anthropicBody.model) && anthropicBody.tools?.length > 0;

    if (isPaidCall) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { cookies: { getAll: () => cookieStore.getAll() } }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return Response.json({ error: 'not_authenticated', message: 'Please log in to search.' }, { status: 401 });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return Response.json({ error: 'profile_error', message: 'Could not load your profile.' }, { status: 500 });
      }

      if (profile.credits < CREDIT_COST) {
        return Response.json({ error: 'no_credits', message: 'You have no searches left.', credits: 0 }, { status: 402 });
      }

      if (!anthropicBody.system && anthropicBody.messages?.length > 0) {
        anthropicBody.system = [
          {
            type: "text",
            text: "You are Gemly, an expert AI shopping assistant specializing in fashion, sneakers, luxury goods, and vintage items. You help users find the best deals on secondhand and new items across platforms like eBay, Vinted, Grailed, StockX, Vestiaire Collective, Depop, and Marktplaats. Always return valid JSON only, no markdown, no explanation. Only return real URLs from search results.",
            cache_control: { type: "ephemeral" }
          }
        ];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "web-search-2025-03-05,prompt-caching-2024-07-31",
        },
        body: JSON.stringify(anthropicBody),
      });

      let data = await response.json();

      if (response.ok && !data.error) {
        // URL validatie op listing responses
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

        await supabase
          .from('profiles')
          .update({
            credits: profile.credits - CREDIT_COST,
            total_searches: (profile.total_searches || 0) + 1
          })
          .eq('id', user.id);

        data._credits_remaining = profile.credits - CREDIT_COST;
      }

      return Response.json(data, { status: response.status });
    }

    // Free calls
    if (!anthropicBody.system && anthropicBody.messages?.length > 0) {
      anthropicBody.system = [
        {
          type: "text",
          text: "You are Gemly, an expert AI shopping assistant specializing in fashion, sneakers, luxury goods, and vintage items. You help users find the best deals on secondhand and new items across platforms like eBay, Vinted, Grailed, StockX, Vestiaire Collective, Depop, and Marktplaats. Always return valid JSON only, no markdown, no explanation. Only return real URLs from search results.",
          cache_control: { type: "ephemeral" }
        }
      ];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05,prompt-caching-2024-07-31",
      },
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
