// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const API_KEY = "sk‑or‑v1‑1c4f07540458d32bf203c4cc18aa371f36157a7e8fdcf983141da8631a7e..."; // sementara buat tes

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

const pathBot = './daftarBot.json';
let daftarBot = fs.existsSync(pathBot) ? JSON.parse(fs.readFileSync(pathBot)) : [];

client.on('qr', qr => {
  console.log('Scan QR Code berikut:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot siap digunakan!');
});

client.on('message', async msg => {
  const chat = await msg.getChat();
  const isi = msg.body.trim().toLowerCase();
  const from = msg.from.split('@')[0];

  if (isi.startsWith('jadi bot ')) {
    const nomor = isi.split(' ')[2]?.replace(/\D/g, '');
    if (nomor && !daftarBot.includes(nomor)) {
      daftarBot.push(nomor);
      fs.writeFileSync(pathBot, JSON.stringify(daftarBot, null, 2));
      msg.reply(`✅ Nomor +${nomor} telah aktif sebagai bot!`);
    }
    return;
  }

  const bolehRespon = daftarBot.includes(from);
  const disebut = chat.isGroup ? msg.mentionedIds.includes(client.info.wid._serialized) : true;

  if (bolehRespon && (!chat.isGroup || disebut)) {
    msg.reply('Halo dari bot ringan yang kamu bikin! 🌱');
  }
});

client.initialize();
