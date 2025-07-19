const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  pasajero: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  origen: {
    direccion: String,
    lat: Number,
    lng: Number
  },
  destino: {
    direccion: String,
    lat: Number,
    lng: Number
  },
  estado: {
    type: String,
    enum: ['pendiente', 'asignado', 'en_curso', 'finalizado', 'cancelado'],
    default: 'pendiente'
  },
  tarifa: Number,
  distancia_km: Number,
  duracion_min: Number,
  calificacion_pasajero: Number,
  calificacion_conductor: Number,
  comentario: String,
  creadoEn: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
