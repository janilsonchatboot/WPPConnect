const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
require('dotenv').config();

const app = express();
app.use(express.json());

let client;

create({
  session: process.env.SESSION_NAME,
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Flags necessárias para rodar como root
  },
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('QR RECEIVED', base64Qrimg);
  },
  statusFind: (status) => {
    console.log('Status da sessão:', status);
  },
}).then((clientInstance) => {
  client = clientInstance;
  console.log('WhatsApp API conectada!');
}).catch((error) => {
  console.error('Erro ao conectar com o WhatsApp:', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
