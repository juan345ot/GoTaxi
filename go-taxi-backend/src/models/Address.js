const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    calle: {
      type: String,
      required: true,
      trim: true,
    },
    altura: {
      type: String,
      trim: true,
    },
    ciudad: {
      type: String,
      required: true,
      trim: true,
    },
    direccionCompleta: {
      type: String,
      required: true,
      trim: true,
    },
    coordenadas: {
      latitud: {
        type: Number,
      },
      longitud: {
        type: Number,
      },
    },
    esFavorita: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Índice compuesto para búsquedas rápidas
addressSchema.index({ usuario: 1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);
