console.log('🔴 BOT STARTING...'); // PASTI KELUAR DI LOGS!

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    try {
        console.log('🟡 INITIATING WHATSAPP CONNECTION...');
        
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: { level: 'silent' }
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, qr } = update;
            
            console.log('🟠 CONNECTION UPDATE:', connection);
            
            if (qr) {
                console.log('📱 SCAN QR CODE INI:');
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'open') {
                console.log('✅ BOT BERHASIL TERHUBUNG!');
                console.log('🤖 BOT SIAP MELAYANI!');
            }
            
            if (connection === 'close') {
                console.log('🔴 CONNECTION CLOSED - RECONNECTING...');
                setTimeout(connectToWhatsApp, 5000);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', ({ messages }) => {
            console.log('📨 PESAN DITERIMA:', messages[0]?.key?.remoteJid);
        });

    } catch (error) {
        console.log('❌ ERROR:', error);
        setTimeout(connectToWhatsApp, 5000);
    }
}

// START THE BOT
connectToWhatsApp();

console.log('🔴 BOT SCRIPT LOADED - WAITING FOR CONNECTION...');
