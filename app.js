const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const { createDefaultAdmin } = require('./controllers/authController');

const app = express();
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/supernova', { useNewUrlParser: true, useUnifiedTopology: true });

// Criar administrador padrão
createDefaultAdmin();

// Rotas
app.use('/auth', authRoutes);

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));