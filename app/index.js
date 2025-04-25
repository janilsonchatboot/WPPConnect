const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
require('dotenv').config();

const app = express();
app.use(express.json());

let client;
let qrCodeBase64 = null; // ← Armazena o QR Code para exibição no navegador

// Função para criar a sessão do WhatsApp e configurar o QR Code
create({
  session: process.env.SESSION_NAME,
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessário para rodar em ambiente sem GUI
  },
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('📲 QR Code capturado com sucesso!');
    console.log('🔗 URL do QR Code:', urlCode);
    qrCodeBase64 = base64Qrimg; // ← Armazena o QR Code em base64
  },
  statusFind: (status) => {
    console.log('Status da sessão:', status); // Mostra o status da sessão
  },
}).then((clientInstance) => {
  client = clientInstance;
  console.log('✅ WhatsApp API conectada!');
}).catch((error) => {
  console.error('❌ Erro ao conectar com o WhatsApp:', error);
});

// Rota para exibir o QR Code no navegador
app.get('/qrcode', (req, res) => {
  if (!qrCodeBase64) {
    return res.send('QR Code ainda não gerado. Aguarde...');
  }

  // HTML para exibir o QR Code com um layout simples
  const html = `
    <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f0f0;">
        <div style="text-align:center">
          <h2>Escaneie o QR Code</h2>
          <img src="${qrCodeBase64}" />
        </div>
      </body>
    </html>
  `;
  res.send(html);
});

// Inicia o servidor na porta definida, ou 3000 por padrão
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
