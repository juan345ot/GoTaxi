require('dotenv').config();

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
  res.status(200).json({
    ok: true,
    service: 'go-taxi-backend',
    env: process.env.NODE_ENV || 'development',
  });
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
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

// --- Middleware global de manejo de errores ---
app.use(errorHandler);

// --- Conexión a MongoDB ---
if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 MongoDB conectado'))
    .catch((err) => {
      console.error('🔴 Error conectando a MongoDB:', err.message);
      process.exit(1);
    });
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
