const mongoose = require('mongoose');

module.exports = async () => {
  try {
    // Cerrar todas las conexiones de Mongoose
    const connections = mongoose.connections;
    for (const connection of connections) {
      if (connection.readyState !== 0) {
        console.log(`🧹 Cerrando conexión de Mongoose: ${connection.name}...`);
        await connection.close();
      }
    }
    
    // Cerrar conexión principal de Mongoose
    if (mongoose.connection.readyState !== 0) {
      console.log('🧹 Cerrando conexión principal de Mongoose...');
      await mongoose.disconnect();
      console.log('✅ Conexión de Mongoose cerrada correctamente');
    }
    
    // Cerrar MongoMemoryServer si existe
    if (global.__MONGOD__) {
      console.log('🧹 Cerrando MongoMemoryServer...');
      await global.__MONGOD__.stop();
      console.log('✅ MongoMemoryServer cerrado correctamente');
    }
    
    // Dar tiempo para que las conexiones se cierren completamente
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('❌ Error en teardown global:', error);
  }
};
