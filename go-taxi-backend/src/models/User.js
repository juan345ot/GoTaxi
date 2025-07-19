const mongoose = require('mongoose');

const USER_ROLES = ['admin', 'conductor', 'pasajero'];

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: USER_ROLES, default: 'pasajero' },
  telefono: { type: String },
  foto: { type: String },
  activo: { type: Boolean, default: true },
  penalizaciones: [{ motivo: String, fecha: Date }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
