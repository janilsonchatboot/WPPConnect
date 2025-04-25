const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

let client;
let qrCodeBase64 = null;
let messages = [];

// Garante que a pasta de áudios existe
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

create({
  session: process.env.SESSION_NAME,
  autoClose: 0, // mantém o QR ativo até escanear
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('📲 QR Code capturado com sucesso!');
    console.log('🔗 URL do QR Code:', urlCode);
    qrCodeBase64 = base64Qrimg;
  },
  statusFind: (status) => {
    console.log('Status da sessão:', status);
  },
  messageReceived: (message) => {
    console.log('Nova mensagem recebida:', message);
    messages.push(message);
  },
  audioReceived: (audio) => {
    console.log('Áudio recebido:', audio);
    const filePath = path.join(audioDir, `${audio.id}.mp3`);
    fs.writeFileSync(filePath, audio.data);
    messages.push({ from: audio.from, body: '[Áudio Recebido]', audioPath: filePath });
  }
}).then((clientInstance) => {
  client = clientInstance;
  console.log('✅ WhatsApp API conectada!');
}).catch((error) => {
  console.error('❌ Erro ao conectar com o WhatsApp:', error);
});

// Rota para exibir o QR Code
app.get('/qrcode', (req, res) => {
  if (!qrCodeBase64) {
    return res.send('QR Code ainda não gerado. Aguarde...');
  }

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

// Rota para recuperar mensagens
app.get('/messages', (req, res) => {
  res.json(messages);
});

// Rota para enviar texto
app.post('/send', (req, res) => {
  const { to, message } = req.body;
  client.sendText(to, message)
    .then(() => res.json({ status: 'Mensagem enviada com sucesso!' }))
    .catch(err => res.status(500).json({ error: err }));
});

// Rota para enviar áudio (por URL)
app.post('/send-audio', (req, res) => {
  const { to, audioUrl } = req.body;
  client.sendAudio(to, audioUrl)
    .then(() => res.json({ status: 'Áudio enviado com sucesso!' }))
    .catch(err => res.status(500).json({ error: err }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
