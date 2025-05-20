const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

// Konfigurasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// Tampilkan QR Code
client.on("qr", (qr) => {
  console.log("SCAN INI DI WHATSAPP:");
  qrcode.generate(qr, { small: true });
});

// Bot siap
client.on("ready", () => {
  console.log("✅ BOT AKTIF!");
});

// Inisialisasi bot
client.initialize();

// Jaga server tetap hidup
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});
