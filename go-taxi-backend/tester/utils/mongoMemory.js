const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Conecta a una instancia de MongoDB en memoria para pruebas.
 *
 * Se crea un nuevo servidor de MongoMemoryServer si todavía no existe y se
 * conecta Mongoose al URI generado. Se puede especificar un nombre de
 * base de datos mediante la variable de entorno MONGO_TEST_DB_NAME o
 * pasando un argumento. El URI se asigna a process.env.MONGO_URI para
 * que el backend utilice esta conexión durante las pruebas.
 *
 * @param {string} [dbName] Nombre de la base de datos a utilizar
 * @returns {Promise<mongoose.Connection>} La conexión de Mongoose activa
 */
async function connect(dbName = process.env.MONGO_TEST_DB_NAME || 'gotaxi_test') {
  // Reusar la misma instancia si ya fue creada
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const uri = mongoServer.getUri();
  // Exponer la URI para que la aplicación la utilice
  process.env.MONGO_URI = uri;
  // Conectar Mongoose al servidor en memoria con el nombre de base de datos elegido
  await mongoose.connect(uri, { dbName });
  return mongoose.connection;
}

/**
 * Desconecta y detiene el servidor de MongoMemory.
 *
 * Al finalizar, se eliminan los datos de la base de datos en memoria y
 * se liberan los recursos. Si no se ha creado un servidor, simplemente
 * cierra la conexión de Mongoose si está abierta.
 */
async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    // Borrar la base de datos para evitar datos residuales entre pruebas
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

module.exports = { connect, disconnect };
