const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
require('dotenv').config();

const app = express();
app.use(express.json());

let client;
let qrCodeBase64 = null; // Armazena o QR Code para visualização
let qrCodeGenerated = false;

// Inicializa o WPPConnect
create({
  session: process.env.SESSION_NAME || 'whatsapp-session',
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('\n📲 QR Code capturado com sucesso!');
    console.log('🖼️  QR Code Base64 atualizado.');
    qrCodeBase64 = base64Qrimg;
    qrCodeGenerated = true;
  },
  statusFind: (statusSession) => {
    console.log('🔄 Status da sessão:', statusSession);
  },
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 60_000, // aumenta timeout para evitar erro
  }
})
.then((clientInstance) => {
  client = clientInstance;
  console.log('✅ WhatsApp API conectada!');
})
.catch((err) => {
  console.error('❌ Erro ao iniciar a sessão do WhatsApp:', err);
});

// Endpoint para visualizar o QR Code
app.get('/qrcode', (req, res) => {
  if (!qrCodeBase64 || !qrCodeGenerated) {
    return res.send('<h2>⏳ QR Code ainda não gerado. Aguarde...</h2>');
  }

  const html = `
    <html>
      <head><title>QR Code - WPPConnect</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f4f4f4;">
        <h2>Escaneie o QR Code para conectar ao WhatsApp</h2>
        <img src="${qrCodeBase64}" style="width:300px;height:300px;border:1px solid #ccc;" />
        <p>Atualize esta página se o código expirar.</p>
      </body>
    </html>
  `;
  res.send(html);
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console
