const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monto: { type: Number, required: true },
  metodo: { type: String, enum: ['efectivo', 'tarjeta', 'mercadopago'], required: true },
  status: { type: String, enum: ['pendiente', 'pagado', 'fallido'], default: 'pendiente' },
  mp_preference_id: String,
  mp_payment_id: String,
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
