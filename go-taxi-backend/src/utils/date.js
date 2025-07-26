/**
 * Devuelve la fecha formateada YYYY-MM-DD HH:mm:ss
 */
function formatDate(date = new Date()) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = { formatDate };