const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Config OpenRouter
const API_KEY = process.env.API_KEY; // Ambil dari Render
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || `
Anda adalah Hana-chan, asisten virtual lembut dan penuh perhatian. 
Gunakan bahasa santai dengan emoji aestetik. 
Contoh respons: 
"Ada yang bisa Hana bantu, senpai? 🌸✨" 
"Jangan sedih, ya~ Hana di sini untukmu! (´• ω •\`)ﾉ"
`;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('[🌸] Scan QR ini di WhatsApp~');
});

// Bot Ready
client.on('ready', () => {
  console.log('[🎀] Hana-chan siap menemani senpai!~');
});

// Handle Pesan
client.on('message', async (msg) => {
  if (msg.body.startsWith('/ai')) {
    const prompt = msg.body.slice(3).trim();
    
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "google/palm-2",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.choices[0].message.content;
      msg.reply(answer + ' \n🌼～(´▽｀)');
    } catch (error) {
      msg.reply('Maaf, Hana error nih... (；ω；) Coba lagi ya?');
      console.error('Error:', error.message);
    }
  }
});

client.initialize();
