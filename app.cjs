const express = require('express');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/supernova', { useNewUrlParser: true, useUnifiedTopology: true });

// Criar administrador padrão
// createDefaultAdmin();

// Rotas
// app.use('/auth', authRoutes);

// Endpoint para enviar mensagem via Telegram Bot
app.post('/telegram/send', async (req, res) => {
  const { chat_id, text } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Token do Telegram não configurado.' });
  }
  if (!chat_id || !text) {
    return res.status(400).json({ error: 'chat_id e text são obrigatórios.' });
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text })
    });
    const data = await response.json();
    if (!data.ok) {
      return res.status(400).json({ error: data.description });
    }
    res.json({ success: true, result: data.result });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem para o Telegram.' });
  }
});

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
let lastUpdateId = 0;
let telegramMessages = [];

// Função de polling para buscar novas mensagens
async function pollTelegramMessages() {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${lastUpdateId + 1}`);
    const data = await response.json();
    if (data.ok && data.result.length > 0) {
      data.result.forEach(update => {
        lastUpdateId = update.update_id;
        if (update.message) {
          telegramMessages.push({
            message_id: update.message.message_id,
            from: update.message.from?.username || update.message.from?.first_name || 'Desconhecido',
            text: update.message.text,
            date: update.message.date,
            chat_id: update.message.chat.id
          });
        }
      });
      // Limitar o array para não crescer indefinidamente
      if (telegramMessages.length > 100) telegramMessages = telegramMessages.slice(-100);
    }
  } catch (err) {
    // Apenas loga o erro, não interrompe o polling
    console.error('Erro no polling do Telegram:', err);
  }
}
// Iniciar polling a cada 2 segundos
setInterval(pollTelegramMessages, 2000);

// Endpoint para buscar mensagens recebidas
app.get('/telegram/messages', (req, res) => {
  res.json({ messages: telegramMessages });
});

app.listen(3000);