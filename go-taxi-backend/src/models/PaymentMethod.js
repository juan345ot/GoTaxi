const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['tarjeta', 'mercadopago'], required: true },
  datos: Object,
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
