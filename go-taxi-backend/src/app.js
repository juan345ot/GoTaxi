require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máx requests por IP
});
app.use(limiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado!'))
.catch((err) => {
  console.error('Error conectando a MongoDB:', err.message);
  process.exit(1);
});

// Rutas base (agregá las rutas específicas más adelante)
app.get('/', (req, res) => {
  res.send('¡GoTaxi Backend corriendo!');
});

// Importar rutas de autenticación
const authRoutes = require('./api/routes/authRoutes');
app.use('/api/auth', authRoutes);

// WebSocket para tracking en tiempo real (configura más adelante)
const { createServer } = require('http');
const { Server } = require('ws');

const server = createServer(app);
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket conectado');
  // ws.on('message', ...) // Lógica más adelante
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚖 GoTaxi Backend en puerto ${PORT}`);
});

module.exports = app;
