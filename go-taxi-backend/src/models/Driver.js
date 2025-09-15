const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Licencia única para cada conductor
    licencia: { type: String, required: true, unique: true },
    vehiculo: {
      marca: { type: String, required: false },
      modelo: { type: String, required: false },
      color: { type: String, required: false },
      // La patente es única si se proporciona; sparse permite múltiples null/undefined
      patente: { type: String, unique: true, sparse: true },
    },
    aprobado: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Driver', driverSchema);
