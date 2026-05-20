import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAID_MODELS = ['claude-sonnet-4-5'];
const CREDIT_COST = 1;

export async function POST(request) {
  try {
    const body = await request.json();

    // Strip custom fields before sending to Anthropic
    const { is_listing_search, ...anthropicBody } = body;

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

      const data = await response.json();

      if (response.ok && !data.error) {
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
