const { randomUUID } = require('crypto');

/**
 * Genera un usuario de prueba con campos compatibles con la API actual.
 *
 * Por defecto se generan nombres y apellidos aleatorios, un email único y
 * una contraseña genérica. Se puede pasar un objeto `overrides` para
 * sobrescribir cualquier propiedad (p. ej. rol, teléfono, licencia).
 *
 * @param {Object} overrides Campos para sobrescribir en el usuario generado
 * @returns {Object} Usuario listo para enviarse al endpoint de registro
 */
function buildUser(overrides = {}) {
  const rnd = randomUUID().slice(0, 8);
  return {
    nombre: 'Test',
    apellido: `User${rnd}`,
    email: `test_${rnd}@example.com`,
    password: 'Passw0rd!',
    role: 'pasajero',
    ...overrides,
  };
}

module.exports = { buildUser };
