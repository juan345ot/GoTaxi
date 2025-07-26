const cors = require('cors');
const whitelist = [
  'http://localhost:3000', // Panel admin web
  'http://localhost:19006', // App mobile Expo
  // Agregá tus dominios productivos
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) callback(null, true);
    else callback(new Error('No permitido por CORS'));
  },
  credentials: true
};

module.exports = cors(corsOptions);