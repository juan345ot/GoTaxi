jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Mocks de integraciones externas
jest.mock('mercadopago');
jest.mock('nodemailer');