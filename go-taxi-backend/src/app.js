require('dotenv').config();
/* eslint-disable no-console */

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');

// Middlewares
const cors = require('./middlewares/cors');
const logger = require('./middlewares/logger');
const rateLimit = require('./middlewares/rateLimit');
const sanitize = require('./middlewares/sanitize');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Seguridad y utilidades ---
app.use(helmet());
app.use(cors);
app.use(express.json());
app.use(sanitize);
app.use(logger);
app.use(rateLimit);

// --- Carpeta de archivos subidos ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Healthcheck ---
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const health = {
    ok: true,
    service: 'go-taxi-backend',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoStates[mongoStatus] || 'unknown',
      connected: mongoStatus === 1,
    },
  };

  // Si MongoDB no está conectado, retornar 503 pero mantener ok: true para indicar que el servicio está corriendo
  const statusCode = mongoStatus === 1 ? 200 : 503;
  res.status(statusCode).json(health);
});

// --- Home simple ---
app.get('/', (_req, res) => res.send('🚖 GoTaxi Backend operativo'));

// --- Rutas REST principales ---
app.use('/api/auth', require('./api/routes/authRoutes'));
app.use('/api/users', require('./api/routes/userRoutes'));
app.use('/api/drivers', require('./api/routes/driverRoutes'));
app.use('/api/admins', require('./api/routes/adminRoutes'));
app.use('/api/trips', require('./api/routes/tripRoutes'));
app.use('/api/trips', require('./api/routes/chatRoutes')); // Chat messages for trips
app.use('/api/payments', require('./api/routes/paymentRoutes'));
app.use('/api/payment-methods', require('./api/routes/paymentMethodRoutes'));
app.use('/api/ratings', require('./api/routes/ratingRoutes'));
app.use('/api/configs', require('./api/routes/configRoutes'));

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ENDPOINT_NOT_FOUND',
    message: 'Endpoint no encontrado',
  });
});

// --- Middleware global de manejo de errores ---
app.use(errorHandler);

// --- Conexión a MongoDB ---
// No conectar en modo test (los tests manejan su propia conexión)
if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
        socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
      })
      .then(() => console.log('🟢 MongoDB conectado'))
      .catch(err => {
        console.error('🔴 Error conectando a MongoDB:', err.message);
        console.warn('⚠️ El servidor continuará ejecutándose sin MongoDB. Algunas funcionalidades no estarán disponibles.');
        // No hacer process.exit(1) para permitir que el servidor continúe
        // El healthcheck mostrará el estado de MongoDB
      });
  } else {
    console.warn('⚠️ MONGO_URI no configurado. El servidor continuará sin MongoDB.');
  }
}

// --- HTTP Server + WebSocket ---
const { createServer } = require('http');
const server = createServer(app);

function bootSockets(httpServer) {
  try {
    const { initTrackingSocket } = require('./sockets/trackingSocket');
    initTrackingSocket(httpServer);
  } catch (e) {
    console.warn('⚠️ Sockets no inicializados:', e?.message || e);
  }
}

// Inicializar sockets sólo si no estamos en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
  bootSockets(server);
}

// --- Arranque del servidor ---
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`🚖 GoTaxi Backend escuchando en puerto ${PORT}`);
  });
}

// Exportar la app para que Supertest/Jest la pueda importar sin levantar el servidor
module.exports = app;
