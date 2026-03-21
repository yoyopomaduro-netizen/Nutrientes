// ✅ Extraer texto correctamente (robusto)
let text = "";

// Caso 1: formato responses API
if (data.output && Array.isArray(data.output)) {
  for (const item of data.output) {
    if (item.content && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c.text) text += c.text;
      }
    }
  }
}

// Caso 2: fallback
if (!text && data.output_text) {
  text = data.output_text;
}
