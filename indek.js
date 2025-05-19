// Di file server/index.js
client.on('message', async msg => {
  // Jangan proses jika:
  // 1. Pesan dari grup
  // 2. Bukan perintah !nanami
  if (msg.isGroupMsg || !msg.body.startsWith('!nanami')) {
    return;
  }

  // Ekstrak pertanyaan
  const prompt = msg.body.slice(8).trim();
  
  try {
    // Kirim ke API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [/* ... */]
      })
    });
    
    const data = await response.json();
    await msg.reply(data.choices[0].message.content);
    
  } catch (error) {
    await msg.reply("⑅˘꒳˘) Maaf, Nanami lagi error nih~ Coba lagi ya!");
  }
});
