const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys')
const express = require('express')

const app = express()
app.use(express.json())

// !!! PASTIN ADA INI !!!
app.get('/api/whatsapp', (_, res) => {
  res.status(200).json({ status: 'Bot udah nyala bang!' })
})

// ... (kode Baileys sebelumnya)

module.exports = app // <- INI YG PALING PENTING
