const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const { chromium } = require("playwright-core"); // Pakai playwright-core

// Konfigurasi WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  browser: {
    browser: chromium,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process"
    ],
    executablePath: "/usr/bin/chromium-browser" // Path default Chromium di Railway
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

client.initialize();

// Jaga server tetap hidup
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});
