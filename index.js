// index.js
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const moment = require('moment');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: { level: 'silent' } // Biar ga berisik
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('Scan QR ini di WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('✅ BOT BERHASIL TERHUBUNG!');
            console.log('🚀 Bot siap melayani!');
        }
        if (connection === 'close') {
            console.log('❌ Koneksi terputus, restarting...');
            startBot(); // Auto restart
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // HANDLE PESAN MASUK
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        const text = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || 
                    msg.message.imageMessage?.caption || '';
        
        const sender = msg.key.remoteJid;
        const command = text.toLowerCase();

        // FITUR CEPAT & RESPONSIF
        if (command === '!ping') {
            await sock.sendMessage(sender, { text: '🏓 PONG! Bot aktif!' });
        }
        else if (command === '!menu') {
            const menu = `
🤖 *BOT WHATSAPP* 
━━━━━━━━━━━━━━
📝 *FITUR UTAMA:*
• !ping - Test bot
• !menu - Menu ini
• !info - Status bot
• !sticker - Buat sticker
• !tts [teks] - Text to speech
• !quotemaker [teks] - Buat quote

🎵 *DOWNLOADER:*
• !yt [url] - Download YouTube
• !tiktok [url] - Download TikTok

🔍 *TOOLS:*
• !q [pertanyaan] - Tanya AI
• !cuaca [kota] - Info cuaca
            `;
            await sock.sendMessage(sender, { text: menu });
        }
        else if (command.startsWith('!sticker')) {
            // Auto convert gambar jadi sticker
            if (msg.message.imageMessage) {
                await sock.sendMessage(sender, { 
                    text: '🔄 Membuat sticker...' 
                });
                // Logic buat sticker disini
            }
        }
        else if (text) {
            // AUTO RESPONSE SMART
            if (command.includes('hai') || command.includes('halo')) {
                await sock.sendMessage(sender, { 
                    text: `Halo! 👋 Ada yang bisa saya bantu?\nKetik !menu untuk melihat fitur.` 
                });
            }
        }
    });
}

// JALANKAN BOT
startBot().catch(console.error);
