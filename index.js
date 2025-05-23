const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
require('dotenv').config()

// ========== CONFIGURASI ==========
const API_CONFIG = {
  URL: process.env.API_URL,
  KEY: process.env.API_KEY,
  MODEL: 'gryphe/mythomax-l2-13b'
}

async function startBot() {
  // 1. Inisialisasi Session
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  // 2. Buat Koneksi WhatsApp
  const bot = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Chrome', 'Linux', '1.0.0']
  })

  // 3. Handle QR Code
  bot.ev.on('qr', qr => {
    qrcode.generate(qr, { small: true })
    console.log('\n\n=== SCAN QR INI ===\n')
  })

  // 4. Handle Koneksi
  bot.ev.on('connection.update', (update) => {
    console.log('Status:', update.connection)
    if (update.connection === 'close') setTimeout(startBot, 3000)
  })

  // 5. Handle Pesan
  bot.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return
      
      const body = msg.message.conversation || ''
      const chatId = msg.key.remoteJid

      // Kirim "typing..."
      await bot.sendPresenceUpdate('composing', chatId)

      // API Call ke OpenRouter
      const response = await axios.post(
        API_CONFIG.URL,
        {
          model: API_CONFIG.MODEL,
          messages: [
            {
              role: "system",
              content: "Anda Nanami Chan, gadis anime imut. Gunakan emoji dan panggil user 'Senpai'. Contoh: 'Ah, Senpai~ (✿◕‿◕)'"
            },
            { role: "user", content: body }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${API_CONFIG.KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Balas pesan
      await bot.sendMessage(chatId, {
        text: response.data.choices[0].message.content
      })

    } catch (error) {
      console.error('Error:', error.message)
      await bot.sendMessage(chatId, {
        text: 'Gomen ne, error desu~ (´；ω；`)'
      })
    }
  })

  // 6. Simpan Session
  bot.ev.on('creds.update', saveCreds)
}

// 7. Mulai Bot
startBot().catch(err => console.error('Error:', err))
