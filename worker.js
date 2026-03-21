export default {
  async fetch(req) {
    try {
      if (req.method !== "POST") {
        return new Response("Método no permitido", { status: 405 });
      }

      const body = await req.json();

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: body.messages,
          max_tokens: 400
        })
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message
      }), { status: 500 });
    }
  }
};
