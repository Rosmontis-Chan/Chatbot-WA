const { default: makeWASocket } = require('@adiwajshing/baileys')

const startBot = async () => {
  const sock = makeWASocket({
    auth: { creds: {}, keys: {} }, // JANGAN PAKE SESSION FILE
    printQRInTerminal: true,
    browser: ['CHINA-BOT', 'Chrome', '1.0.0']
  })
  
  // TAMBAH INI UNTUK JAGA KONEKSI
  setInterval(() => {
    sock.ev.emit('connection.update', { qr: 'refresh' })
  }, 10000)
}

startBot().catch(console.error) 
