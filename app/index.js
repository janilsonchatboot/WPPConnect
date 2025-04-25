const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
require('dotenv').config();
const fs = require('fs'); // Para salvar áudio recebido

const app = express();
app.use(express.json());

let client;
let messages = []; // Armazenar mensagens recebidas

create({
  session: process.env.SESSION_NAME,
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('📲 QR Code capturado com sucesso!');
    console.log('🔗 URL do QR Code:', urlCode);
  },
  statusFind: (status) => {
    console.log('Status da sessão:', status);
  },
  messageReceived: (message) => {
    console.log('Nova mensagem recebida:', message);
    messages.push(message); // Adiciona a mensagem à lista
  },
  audioReceived: (audio) => {
    console.log('Áudio recebido:', audio);
    // Salvar o áudio no servidor
    const filePath = `./audio/${audio.id}.mp3`;
    fs.writeFileSync(filePath, audio.data); // Salvar o áudio
    messages.push({ from: audio.from, body: '[Áudio Recebido]' }); // Notificar no painel
  }
}).then((clientInstance) => {
  client = clientInstance;
  console.log('✅ WhatsApp API conectada!');
}).catch((error) => {
  console.error('❌ Erro ao conectar com o WhatsApp:', error);
});

// Rota para pegar mensagens
app.get('/messages', (req, res) => {
  res.json(messages);
});

// Rota para enviar mensagens
app.post('/send', (req, res) => {
  const { to, message } = req.body;
  client.sendText(to, message)
    .then(() => {
      res.json({ status: 'Mensagem enviada com sucesso!' });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// Rota para enviar áudio
app.post('/send-audio', (req, res) => {
  const { to, audioUrl } = req.body; // URL do arquivo de áudio
  client.sendAudio(to, audioUrl)
    .then(() => {
      res.json({ status: 'Áudio enviado com sucesso!' });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
