/**
 * Genera un código aleatorio para validaciones, códigos de viaje, etc.
 * @param {number} length
 * @returns {string}
 */
function randomCode(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
}

/**
 * Normaliza emails (lowercase, trim)
 */
function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

module.exports = { randomCode, normalizeEmail };