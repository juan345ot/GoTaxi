require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');

// Middlewares PRO
const cors = require('./middlewares/cors'); // Usá este si tenés cors.js, si no: require('cors')
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

// --- Rutas REST principales ---
app.get('/', (req, res) => res.send('🚖 GoTaxi Backend funcionando y seguro!'));

app.use('/api/auth', require('./api/routes/authRoutes'));
app.use('/api/users', require('./api/routes/userRoutes'));
app.use('/api/drivers', require('./api/routes/driverRoutes'));
app.use('/api/admins', require('./api/routes/adminRoutes'));
app.use('/api/trips', require('./api/routes/tripRoutes'));
app.use('/api/payments', require('./api/routes/paymentRoutes'));
app.use('/api/payment-methods', require('./api/routes/paymentMethodRoutes'));
app.use('/api/ratings', require('./api/routes/ratingRoutes'));
app.use('/api/configs', require('./api/routes/configRoutes'));

// --- Manejo de errores (rutas no encontradas) ---
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

// --- Middleware global de manejo de errores ---
app.use(errorHandler);

// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🟢 MongoDB conectado!'))
.catch((err) => {
  console.error('🔴 Error conectando a MongoDB:', err.message);
  process.exit(1);
});

// --- WebSocket Server para tracking real-time ---
const { createServer } = require('http');
const { initTrackingSocket } = require('./sockets/trackingSocket');
const server = createServer(app);

initTrackingSocket(server);

// --- Arranque del servidor ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚖 GoTaxi Backend escuchando en puerto ${PORT}`);
});

module.exports = app;
