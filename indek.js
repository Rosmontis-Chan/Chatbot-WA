const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    // HEADER WAJIB OPENROUTER
    'HTTP-Referer': 'https://chatbot-wa-three.vercel.app/', // Ganti dengan URL Vercel Anda
    'X-Title': 'Nanami WhatsApp Bot'
  },
  body: JSON.stringify({
    model: "openai/gpt-3.5-turbo",
    messages: [/* ... */]
  })
});
