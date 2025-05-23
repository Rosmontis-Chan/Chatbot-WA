const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
require('dotenv').config()

// ===== CONFIGURASI WAJIB =====
const socketConfig = {
  auth: null, // Akan diisi nanti
  printQRInTerminal: true,
  mobile: false, // ← TAMBAH INI
  syncFullHistory: false, // ← TAMBAH INI
  markOnlineOnConnect: false, // ← TAMBAH INI
  browser: ['Nanami Bot', 'Chrome', '1.0.0']
}
// =============================

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  socketConfig.auth = state // ← INISIALISASI AUTH DI SINI

  const bot = makeWASocket(socketConfig)

  // [HANDLER QR CODE]
  bot.ev.on('qr', qr => {
    qrcode.generate(qr, { small: true })
    console.log('=== SCAN QR INI ===')
  })

  // [HANDLER KONEKSI]
  bot.ev.on('connection.update', (update) => {
    if (update.qr) console.log('QR Updated:', update.qr)
    if (update.connection === 'open') {
      console.log('Berhasil terkoneksi!')
      bot.sendPresenceUpdate('available') // ← AKTIFKAN STATUS
    }
    if (update.connection === 'close') {
      console.log('Koneksi terputus, restart dalam 3 detik...')
      setTimeout(startBot, 3000)
    }
  })

  // [HANDLER PESAN]
  bot.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return

      const body = msg.message.conversation || ''
      const chatId = msg.key.remoteJid
      const isGroup = chatId.includes('@g.us')

      // Validasi grup
      if (isGroup && !body.includes('@nanami')) return

      // Typing indicator
      await bot.presenceUpdate(chatId, 'composing')

      // API Call
      const response = await axios.post(process.env.API_URL, {
        model: 'gryphe/mythomax-l2-13b',
        messages: [
          { 
            role: "system", 
            content: "Anda adalah Nanami Chan, gadis anime imut. Gunakan emoji dan bahasa santai." 
          },
          { role: "user", content: body }
        ],
        temperature: 0.7
      }, {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      // Kirim balasan
      const reply = response.data.choices[0].message.content
      await bot.sendMessage(chatId, { text: reply })

    } catch (error) {
      console.error('[ERROR]', error.message)
      await bot.sendMessage(chatId, { text: 'Maaf, error~ (╥﹏╥)' })
    }
  })

  // Simpan session
  bot.ev.on('creds.update', saveCreds)
}

startBot().catch(err => {
  console.error('[FATAL ERROR]', err)
  process.exit(1)
})
