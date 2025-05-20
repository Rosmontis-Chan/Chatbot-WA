// Ketika bot butuh scan QR, kode ini akan muncul di log Railway
  client.on('qr', qr => {
    console.log('QR Code muncul! Scan ini di WhatsApp!');
    generateQrDiTerminal(qr); // Ini akan tampilkan QR di log
  });
