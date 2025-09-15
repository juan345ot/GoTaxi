/**
 * Roles válidos del sistema.
 * Usamos Object.freeze para asegurar que las claves no puedan ser modificadas.
 */
const ROLES = Object.freeze({
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
  PASAJERO: 'pasajero',
});

module.exports = ROLES;
