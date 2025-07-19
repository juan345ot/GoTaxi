const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['tarifa', 'comision'], required: true },
  valor: { type: Number, required: true },
  activo: { type: Boolean, default: true },
  descripcion: String
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
