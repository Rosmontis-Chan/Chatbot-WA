require("dotenv").config();
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const handleMessage = require("./utils/messageHandler");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot sudah online! (≧◡≦)");
});

client.on("message", async (message) => {
  await handleMessage(client, message);
});

client.initialize();
