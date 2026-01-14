jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only-not-for-production';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
// MONGODB_URI se configura en globalSetup.js
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '10';

// Ajustes de entorno para las pruebas
// Definir un puerto por defecto para evitar conflictos al levantar el servidor
process.env.PORT = process.env.PORT || '4000';
// Nombre de la base de datos en memoria (MONGO_MEMORY_SERVER) para pruebas
process.env.MONGO_TEST_DB_NAME = process.env.MONGO_TEST_DB_NAME || 'gotaxi_test';
// URL base utilizada por servicios externos (p.ej. Mercado Pago) en pruebas
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// Mocks de integraciones externas
jest.mock('mercadopago');
jest.mock('nodemailer');
