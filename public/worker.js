export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method === "GET") return new Response(JSON.stringify({ status: "NutriLent Worker activo ✅" }), { headers: cors });

    try {
      const { messages } = await req.json();
      if (!messages?.length) throw new Error("Sin mensajes");

      const msg = messages[0];
      if (Array.isArray(msg.content)) {
        msg.content = msg.content.map(p => {
          if (p.type === "image") {
            return {
              ...p,
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: p.source.data
              }
            };
          }
          return p;
        });
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [msg]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      return new Response(JSON.stringify({ text: data.content[0].text }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Fallo: " + err.message }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
  }
};
