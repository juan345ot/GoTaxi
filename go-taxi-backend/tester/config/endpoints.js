module.exports = {
  health: '/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  payments: {
    createPreference: '/api/payments/create-preference',
    webhook: '/api/payments/webhook',
  },
};