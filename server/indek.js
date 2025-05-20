const { Client, LocalAuth } = require('whatsapp-web.js');
   const qrcode = require('qrcode-terminal');
   const express = require('express');
   require('dotenv').config();

   const client = new Client({
     authStrategy: new LocalAuth({ dataPath: 'session' }),
     puppeteer: {
       headless: true,
       args: ['--no-sandbox', '--disable-setuid-sandbox']
     }
   });

   // Generate QR
   client.on('qr', (qr) => {
     console.log("SCAN QR INI DI WHATSAPP:");
     qrcode.generate(qr, { small: true });
   });

   // Bot Ready
   client.on('ready', () => {
     console.log('🤖 BOT AKTIF!');
   });

   client.initialize();

   // Server
   const app = express();
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`));
