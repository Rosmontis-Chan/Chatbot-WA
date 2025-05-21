const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Konfigurasi OpenRouter
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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"; // Ganti dengan key Anda
const SYSTEM_PROMPT = "Anda adalah asisten AI yang membantu pengguna dengan ramah dan informatif.";

// Inisialisasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

// Generate QR Code
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('🔍 SCAN QR INI DI WHATSAPP ANDA!');
});

// Bot Ready
client.on('ready', () => {
  console.log('✅ BOT AKTIF!');
});

// Handle Pesan
client.on('message', async (msg) => {
  if (msg.body.startsWith('/ai')) {
    const prompt = msg.body.slice(3).trim();
    
    try {
      const response = await axios.post(API_URL, {
        model: "google/palm-2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const answer = response.data.choices[0].message.content;
      msg.reply(answer);
    } catch (e) {
      msg.reply('Maaf, terjadi error. Coba lagi nanti.');
      console.error('OpenRouter Error:', e.response?.data || e.message);
    }
  }
});

// Start Bot
client.initialize();
