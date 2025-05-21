const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys') // PAKAI INI
// ... (kode lainnya tetap sama seperti sebelumnya)
const axios = require('axios')
const express = require('express')

const app = express()
app.use(express.json())

const API_URL = "https://openrouter.ai/api/v1/chat/completions"
const API_KEY = process.env.API_KEY // Gunakan environment variable

async function connectToWhatsApp() {
  const { state, saveState } = useSingleFileAuthState('./auth_info.json')
  
  const sock = makeWASocket({
    version: [2, 2413, 1],
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('connection.update', (update) => {
    if (update.qr) {
      console.log('Scan QR code di terminal')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    if (text && text.startsWith('/ai')) {
      const prompt = text.slice(3).trim()
      
      try {
        const response = await axios.post(API_URL, {
          model: "google/palm-2",
          messages: [{ role: "user", content: prompt }]
        }, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        
        const result = response.data.choices[0].message.content
        await sock.sendMessage(msg.key.remoteJid, { text: result })
      } catch (error) {
        console.error('Error:', error)
      }
    }
  })

  sock.ev.on('creds.update', saveState)
  return sock
}

let sock = null
app.post('/api/whatsapp', async (_, res) => {
  if (!sock) {
    sock = await connectToWhatsApp()
  }
  res.status(200).json({ status: 'Bot aktif' })
})

module.exports = app
