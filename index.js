const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
require('dotenv').config()

// ========== CONFIG ==========
const API_CONFIG = {
  url: process.env.API_URL,
  key: process.env.API_KEY,
  model: 'gryphe/mythomax-l2-13b'
}

const BOT_CONFIG = {
  name: "Nanami Chan",
  prefix: "@nanami",
  owner: "Senpai"
}

const SYSTEM_PROMPT = `
[Karakter Nanami]
1. Gadis anime imut dengan suara manis
2. Selalu gunakan emoji (contoh: 🌸🎀💮)
3. Panggil user "${BOT_CONFIG.owner}"
4. Jangan respons pesan grup tanpa mention
`.trim()
// ============================

async function startBot() {
  // 1. Auth Management
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  
  // 2. Initialize Socket
  const bot = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: { level: 'silent' } // Nonaktifkan log internal
  })

  // 3. QR Code Handler (Simplified)
  bot.ev.on('qr', qr => {
    qrcode.generate(qr, { small: true })
    console.log('\n\n=== SCAN INI DI WHATSAPP ===\n')
  })

  // 4. Connection Handler (Auto-Restart)
  bot.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if(connection === 'close') {
      console.log('Koneksi terputus, mencoba ulang dalam 5 detik...')
      setTimeout(startBot, 5000)
    }
    if(connection === 'open') console.log('Berhasil terhubung!')
  })

  // 5. Message Handler (Ultra Safe)
  bot.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0]
      if(!msg.message || msg.key.fromMe) return
      
      // Basic Validation
      const body = msg.message?.conversation || ''
      const chat = msg.key.remoteJid
      const isGroup = chat.endsWith('@g.us')
      
      if(isGroup && !body.includes(BOT_CONFIG.prefix)) return
      
      // Typing Indicator
      await bot.presenceRequest(chat, 'composing')
      
      // API Call
      const response = await axios.post(API_CONFIG.url, {
        model: API_CONFIG.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: body.replace(BOT_CONFIG.prefix, '').trim() }
        ],
        temperature: 0.7
      }, {
        headers: {
          Authorization: `Bearer ${API_CONFIG.key}`,
          'Content-Type': 'application/json'
        }
      })

      // Send Reply
      const reply = response.data.choices[0].message.content
      await bot.sendMessage(chat, { text: reply })
      
    } catch(error) {
      console.error('ERROR:', error.message)
      await bot.sendMessage(chat, { 
        text: `${BOT_CONFIG.name} lagi error, ${BOT_CONFIG.owner}... 😢`
      })
    }
  })

  // 6. Save Creds
  bot.ev.on('creds.update', saveCreds)
}

// 7. Start Bot dengan Error Handling
startBot().catch(err => {
  console.error('FATAL ERROR:', err)
  process.exit(1)
})

// 8. Keep Alive untuk Railway
const http = require('http')
http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Nanami Bot is Running!')
}).listen(process.env.PORT || 3000)
