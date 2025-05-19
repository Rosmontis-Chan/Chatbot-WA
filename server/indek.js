const { Client, LocalAuth } = require('whatsapp-web.js');
const fetch = require('node-fetch');

// Konfigurasi Client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_DIR || "/tmp/sessions"
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

// Event Handler
client.on('qr', qr => console.log('QR CODE:', qr));
client.on('ready', () => console.log('Bot siap! 🚀'));

client.on('message', async msg => {
  // Skip pesan grup dan non-command
  if (msg.isGroupMsg || !msg.body.startsWith('!nanami')) return;

  try {
    // Kirim ke OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chatbot-wa-three.vercel.app', // Ganti dengan URL Vercel Anda
        'X-Title': 'Nanami WhatsApp Bot'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Kamu adalah Nanami, asisten virtual ceria. Gunakan bahasa Indonesia santai dengan emoji!"
          },
          { role: "user", content: msg.body.slice(8) }
        ]
      })
    });

    const data = await response.json();
    await msg.reply(data.choices[0].message.content);
    
  } catch (error) {
    console.error('Error:', error);
    await msg.reply("⑅˘꒳˘) Maaf, lagi error nih~ Coba lagi ya!");
  }
});

client.initialize();
