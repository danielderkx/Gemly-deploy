export async function POST(request) {
  try {
    const body = await request.json();

    // Add a cacheable system prompt to every request
    // Anthropic caches this after first use — saves tokens on every subsequent call
    if (!body.system && body.messages?.length > 0) {
      body.system = [
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
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
