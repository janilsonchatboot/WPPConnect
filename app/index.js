const express = require('express');
const { create, Whatsapp } = require('@wppconnect-team/wppconnect');
require('dotenv').config();

const app = express();
app.use(express.json());

let client;

// Configuração da sessão do WhatsApp
create({
  session: process.env.SESSION_NAME, // Nome da sessão vindo do arquivo .env
  catchQR: (base64Qrimg, asciiQR, attempt, urlCode) => {
    console.log('QR RECEIVED', base64Qrimg); // QR Code recebido
  },
  statusFind: (status) => {
    console.log('Status da sessão:', status); // Status da conexão
  },
  messageReceived: (message) => {
    console.log('Mensagem recebida:', message);
    // Aqui você pode redirecionar mensagens para uma automação ou IA
  },
}).then((clientInstance) => {
  client = clientInstance;
  console.log('WhatsApp API conectada!');
}).catch((error) => {
  console.error('Erro ao conectar com o WhatsApp:', error);
});

// Webhook para receber mensagens
app.post('/webhook', (req, res) => {
  const message = req.body;
  console.log('Mensagem recebida no webhook:', message);
  // Aqui você pode enviar a mensagem para uma automação ou IA
  res.status(200).send('Mensagem recebida com sucesso');
});

// Inicializando o servidor
const PORT = process.env.PORT || 3000; // Porta configurada no .env ou 3000 por padrão
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
