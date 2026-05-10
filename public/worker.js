const accountId = env.CF_ACCOUNT_ID;
if (!accountId) throw new Error("Falta CF_ACCOUNT_ID en variables de entorno");

const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/default/groq/chat/completions`;

const response = await fetch(gatewayUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "cf-aig-authorization": `Bearer ${env.CF_AIG_TOKEN}`,
  },
  body: JSON.stringify({
    model: "llama-3.2-90b-vision-preview",
    messages: groqMessages,
    max_tokens: 1024,
    temperature: 0.2,
    response_format: { type: "json_object" },
    api_key: env.GROQ_API_KEY, // opcional pero recomendado
  }),
});