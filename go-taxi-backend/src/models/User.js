const mongoose = require('mongoose');

const USER_ROLES = ['admin', 'conductor', 'pasajero'];

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'pasajero' },
    // Teléfono: sólo números, entre 6 y 15 caracteres si se proporciona
    telefono: {
      type: String,
      match: /^[0-9]+$/,
      minlength: 6,
      maxlength: 15,
    },
    foto: { type: String },
    activo: { type: Boolean, default: true },
    penalizaciones: [
      {
        motivo: String,
        fecha: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
