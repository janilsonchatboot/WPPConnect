const express = require('express');
const { create, Whatsapp } = require('wppconnect');
require('dotenv').config();

const app = express();
app.use(express.json());

let client;

create({
  session: process.env.SESSION_NAME,
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('QR RECEIVED', base64Qrimg);
  },
  statusFind: (status) => {
    console.log(status);
  },
  messageReceived: (message) => {
    console.log(message);
    // Aqui você pode redirecionar mensagens para o n8n ou IA
  },
}).then((clientInstance) => {
  client = clientInstance;
  console.log('WhatsApp API conectada');
});

app.post('/webhook', (req, res) => {
  const message = req.body;
  console.log('Mensagem recebida:', message);
  // Aqui você pode enviar para o n8n ou IA para processamento
  res.status(200).send('Mensagem recebida');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
