const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client({
    puppeteer: { headless: true },
    authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Client is ready!'));

client.on('message', async msg => {
    if (msg.body.startsWith('!nanami')) {
        const prompt = msg.body.slice(7);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [/* ... */]
            })
        });
        const data = await response.json();
        msg.reply(data.choices[0].message.content);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
client.initialize();
