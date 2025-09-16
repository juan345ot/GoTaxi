jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

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
