const { makeWASocket } = require('@whiskeysockets/baileys')
const axios = require('axios')

async function startBot() {
  const bot = makeWASocket({
    printQRInTerminal: true,
    auth: { creds: {}, keys: {} } // Mode anonymous
  })

  bot.ev.on('connection.update', (update) => {
    console.log('Status:', update.connection)
    if(update.qr) console.log('QR:', update.qr)
  })

  bot.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if(!msg.message) return
    
    console.log('Pesan diterima:', msg.message.conversation)
    await bot.sendMessage(msg.key.remoteJid, { text: 'Nanami menerima pesan Anda!' })
  })
}

startBot().catch(console.error)
