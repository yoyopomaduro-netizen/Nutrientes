body: JSON.stringify({
  model: "gpt-4o-mini",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64}`
        },
        {
          type: "input_text",
          text: "Analiza esta comida..."
        }
      ]
    }
  ]
})
