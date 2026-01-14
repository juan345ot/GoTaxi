const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Setup global para tests de integración.
 * Configura MongoMemoryServer antes de que se ejecuten los tests.
 */
module.exports = async () => {
  try {
    console.log('🚀 Iniciando setup global para tests de integración...');
    
    // Crear instancia de MongoMemoryServer
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'gotaxi_integration_test'
      }
    });

    // Obtener URI de la instancia en memoria
    const mongoUri = mongoServer.getUri();
    
    // Configurar variable de entorno para que la app use la DB en memoria
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGO_TEST_DB_NAME = 'gotaxi_integration_test';
    
    console.log('✅ MongoMemoryServer configurado para tests de integración');
    console.log(`📊 URI de base de datos: ${mongoUri}`);
    
    // Conectar Mongoose directamente para asegurar la conexión
    await mongoose.connect(mongoUri, {
      dbName: 'gotaxi_integration_test',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Mongoose conectado a MongoDB en memoria');
    
    // Guardar referencia global para cleanup
    global.__MONGOD__ = mongoServer;
    
  } catch (error) {
    console.error('❌ Error configurando MongoMemoryServer:', error);
    process.exit(1);
  }
};
