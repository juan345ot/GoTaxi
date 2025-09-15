const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['tarifa', 'comision'], required: true },
    // El valor debe ser un número positivo (0 incluye tarifas gratuitas o comisiones nulas)
    valor: { type: Number, required: true, min: 0 },
    activo: { type: Boolean, default: true },
    descripcion: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Config', configSchema);
