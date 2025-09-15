const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accion: String,
  entidad: String,
  entidadId: String,
  detalles: Object,
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
