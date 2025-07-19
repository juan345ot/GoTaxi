const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  licencia: { type: String, required: true },
  vehiculo: {
    marca: String,
    modelo: String,
    color: String,
    patente: String
  },
  aprobado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
