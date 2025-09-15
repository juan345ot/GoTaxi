const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    pasajero: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    origen: {
      direccion: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destino: {
      direccion: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    estado: {
      type: String,
      enum: ['pendiente', 'asignado', 'en_curso', 'finalizado', 'cancelado'],
      default: 'pendiente',
    },
    tarifa: { type: Number, min: 0 },
    distancia_km: { type: Number, min: 0 },
    duracion_min: { type: Number, min: 0 },
    calificacion_pasajero: Number,
    calificacion_conductor: Number,
    comentario: String,
    creadoEn: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Trip', tripSchema);
