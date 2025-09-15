/**
 * Formatea una fecha en el patrón "YYYY-MM-DD HH:mm:ss".
 *
 * Por defecto utiliza `toISOString()` para garantizar un formato consistente
 * independientemente de la zona horaria configurada en el servidor. Al
 * reemplazar la "T" por un espacio y recortar los milisegundos, se obtiene
 * un string utilizable tanto en logs como en respuestas de API.
 *
 * Si alguna vez necesitas ajustar a la zona horaria local, se recomienda
 * utilizar Intl.DateTimeFormat con las opciones adecuadas. Por ahora, se
 * mantiene el formato UTC para evitar ambigüedades.
 *
 * @param {Date} date Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date = new Date()) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = { formatDate };
