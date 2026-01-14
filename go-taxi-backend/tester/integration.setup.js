const mongoose = require('mongoose');

/**
 * Configuración específica para tests de integración.
 * El setup global ya configuró MongoMemoryServer.
 */
beforeAll(async () => {
  // Configurar variables de entorno para test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  
  // Verificar que la variable de entorno esté configurada
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurado. El setup global falló.');
  }
  
  // Verificar conexión de Mongoose
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}, 30000); // 30 segundos de timeout para setup

/**
 * Limpieza después de todos los tests de integración.
 */
afterAll(async () => {
  // Cerrar conexión de Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}, 30000); // 30 segundos de timeout para teardown

/**
 * Limpieza entre tests individuales.
 */
beforeEach(async () => {
  // Limpiar todas las colecciones entre tests
  const { collections } = mongoose.connection;
  const deletions = Object.values(collections).map(collection => 
    collection.deleteMany({})
  );
  await Promise.all(deletions);
});
