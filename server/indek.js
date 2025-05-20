// File: index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inisialisasi Bot
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// TAMPILKAN QR CODE DI LOGS RAILWAY
client.on('qr', (qr) => {
  console.log("SCAN INI DI WHATSAPP:");
  qrcode.generate(qr, { small: true }); // QR muncul di logs
});

// BOT SIAP
client.on('ready', () => {
  console.log('BOT AKTIF! 🚀');
});

// JALANKAN BOT
client.initialize();

// Biarkan server tetap hidup
const express = require('express');
const app = express();
app.listen(3000, () => console.log('Server hidup!'));
