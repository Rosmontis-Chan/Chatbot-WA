const { RedisStorage } = require('@adiwajshing/baileys')
const axios = require('axios')

// Keep Alive Function
const keepAlive = async () => {
  try {
    await axios.post(
      `${process.env.QSTASH_URL}/v1/ping`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
          'Upstash-Delay': '10s'
        }
      }
    )
    console.log('PING QSTASH BERHASIL')
  } catch (e) {
    console.log('GAGAL PING:', e.message)
  }
}

// Jalankan tiap 30 detik
setInterval(keepAlive, 30000)

// QR Code akan muncul dalam 15 detik setelah deploy
