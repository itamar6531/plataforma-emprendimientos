require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Configurar Socket.io
require('./socket/socketHandlers')(io);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      messages: '/api/messages',
      predictions: '/api/predictions'
    },
    timestamp: new Date().toISOString()
  });
});

// Montar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/predictions', predictionRoutes);

// Ruta para 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
  console.log(`🔌 Socket.io activado`);
});