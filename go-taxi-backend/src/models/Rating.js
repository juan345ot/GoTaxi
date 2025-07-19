const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pasajero: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  autor: { type: String, enum: ['pasajero', 'conductor'], required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
