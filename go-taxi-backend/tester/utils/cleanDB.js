const mongoose = require('mongoose');

/**
 * Limpia todas las colecciones de la base de datos en memoria.
 *
 * Por defecto elimina el contenido de todas las colecciones abiertas
 * en la conexión actual de Mongoose. Se puede pasar un array de
 * nombres de colecciones para excluirlas del borrado (por ejemplo
 * colecciones de configuración o logs). Los nombres deben coincidir
 * con los usados internamente por Mongoose (sin prefijos ni sufijos).
 *
 * @param {string[]} excludes Array de nombres de colecciones a excluir
 */
module.exports = async function cleanDB(excludes = []) {
  const { collections } = mongoose.connection;
  // Filtrar las colecciones excluidas y preparar las operaciones de borrado
  const deletions = Object.entries(collections)
    .filter(([name]) => !excludes.includes(name))
    .map(([, collection]) => collection.deleteMany({}));
  await Promise.all(deletions);
};
