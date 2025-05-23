const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys')
const axios = require('axios')
require('dotenv').config()

async function startBot() {
  // 1. Initialize Auth
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  
  // 2. Simple Socket Config
  const bot = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Chrome', 'Linux', '1.0.0']
  })

  // 3. QR Code Handler
  bot.ev.on('qr', qr => console.log('QR CODE:', qr))

  // 4. Connection Handler
  bot.ev.on('connection.update', (update) => {
    console.log('Status Koneksi:', update.connection)
    if(update.connection === 'close') startBot()
  })

  // 5. Message Handler (Basic)
  bot.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if(!msg?.message || msg.key.fromMe) return
    
    try {
      const response = await axios.post(
        process.env.API_URL,
        {
          model: 'gryphe/mythomax-l2-13b',
          messages: [
            { role: 'system', content: 'Anda Nanami, gadis anime yang imut. Gunakan emoji dan panggil user "Senpai".' },
            { role: 'user', content: msg.message.conversation }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      await bot.sendMessage(
        msg.key.remoteJid, 
        { text: response.data.choices[0].message.content }
      )
      
    } catch(error) {
      console.log('Error:', error.message)
    }
  })

  // 6. Save Creds
  bot.ev.on('creds.update', saveCreds)
}

// 7. Start Bot
startBot().catch(err => console.log('Start Error:', err.message))
