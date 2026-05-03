export async function POST(request) {
  try {
    const body = await request.json();

    // Add cache_control to last user message for prompt caching (50-90% cost reduction)
    if (body.messages?.length > 0) {
      const lastMsg = body.messages[body.messages.length - 1];
      if (lastMsg.role === "user") {
        if (typeof lastMsg.content === "string") {
          lastMsg.content = [{
            type: "text",
            text: lastMsg.content,
            cache_control: { type: "ephemeral" }
          }];
        } else if (Array.isArray(lastMsg.content) && lastMsg.content.length > 0) {
          lastMsg.content[lastMsg.content.length - 1].cache_control = { type: "ephemeral" };
        }
      }
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
