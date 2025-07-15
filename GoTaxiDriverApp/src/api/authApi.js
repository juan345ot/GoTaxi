import axios from './axiosInstance';

/**
 * Login del conductor.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function loginDriver(email, password) {
  // Mock hasta backend
  // return axios.post('/drivers/login', { email, password });
  return { token: "mock-token", user: { email } };
}

/**
 * Registro conductor.
 * @param {object} data
 * @returns {Promise<{ok: boolean}>}
 */
export async function registerDriver(data) {
  return { ok: true };
}
