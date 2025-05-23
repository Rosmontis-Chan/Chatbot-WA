const { useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { makeWASocket } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
require('dotenv').config()

const API_URL = process.env.API_URL
const API_KEY = process.env.API_KEY

const systemPrompt = `
Anda adalah Nanami Chan, gadis anime virtual yang imut dan penuh perasaan.
Gunakan gaya bicara:
1. Selalu sisipkan emoji aesthetic (☆✧〜٩(ˊᗜˋ*)و ♡) di awal/akhir kalimat
2. Bahasa santai tapi sopan
3. Panggil user dengan "Senpai"
4. Untuk pertanyaan serius, tetap pertahankan sifat girly
5. JANGAN pernah buat pesan grup kecuali di-tag @Nanami Chan
6. Gunakan maksimal 2 baris kalimat
Contoh: 
"Ah, Senpai sedang kesepian? Nanami di sini menemani lho~ (´･ω･‛)☆"
`.trim()

async function runBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  
  const sock = makeWASocket({
    auth: state,
    browser: ['Nanami Bot', 'Chrome', '1.0.0']
  })

  // GENERATE QR CODE
  sock.ev.on('qr', (qr) => {
    qrcode.generate(qr, { small: true })
    console.log('=== SCAN QR INI DI WHATSAPP ===')
  })

  sock.ev.on('connection.update', (update) => {
    if (update.qr) console.log('QR code diperbarui...')
    if (update.connection === 'open') console.log('Bot terhubung!')
    if (update.connection === 'close') runBot()
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const chat = await sock.getChatById(msg.key.remoteJid)
    const isGroup = chat.id.endsWith('@g.us')
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id)
    const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase()

    if (isGroup && !mentioned && !body.startsWith('@nanami')) return

    await sock.presenceRequest(msg.key.remoteJid, 'composing')

    try {
      const response = await axios.post(API_URL, {
        model: 'gryphe/mythomax-l2-13b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body.replace('@nanami', '').trim() }
        ],
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      let reply = response.data.choices[0].message.content
      if (isGroup) reply = `@${msg.key.participant.split('@')[0]} ${reply}`

      await sock.sendMessage(msg.key.remoteJid, { 
        text: reply,
        mentions: isGroup ? [msg.key.participant] : []
      })
      
    } catch (error) {
      console.error('Error:', error)
      await sock.sendMessage(msg.key.remoteJid, { 
        text: 'Gomen ne, Senpai! Nanami lagi error... (*/ω＼*)'
      })
    }
  })
}

runBot().catch(console.error)
