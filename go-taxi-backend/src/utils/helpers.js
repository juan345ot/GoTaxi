const crypto = require('crypto');

/**
 * Genera un código alfanumérico aleatorio de longitud fija.
 *
 * Utiliza `crypto.randomBytes` para asegurar un nivel de entropía superior
 * al de `Math.random()`, generando así códigos difícilmente predecibles.
 * Los bytes aleatorios se convierten en valores del 0 al 35 (0‑9, a‑z)
 * mediante el operador módulo, y luego se transforman a base36. Finalmente
 * se convierten a mayúsculas para evitar confusión entre mayúsculas y
 * minúsculas en ciertos contextos (p. ej. al leer un mensaje de texto).
 *
 * @param {number} length Longitud deseada del código
 * @returns {string} Código aleatorio en mayúsculas
 */
function randomCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, b => (b % 36).toString(36))
    .join('')
    .toUpperCase();
}

/**
 * Normaliza una dirección de correo electrónico.
 * Convierte a minúsculas y elimina espacios en blanco al principio y al final.
 *
 * @param {string} email Dirección de correo electrónico
 * @returns {string} Email normalizado
 */
function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

module.exports = { randomCode, normalizeEmail };
