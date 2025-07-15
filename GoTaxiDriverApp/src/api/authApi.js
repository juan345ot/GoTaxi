import axios from './axiosInstance';

/**
 * Login del conductor.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function loginDriver(email, password) {
  // MOCK hasta el backend
  return { token: "mock-token", user: { email } };
}

/**
 * Registro conductor.
 * @param {object} data
 * @returns {Promise<{ok: boolean}>}
 */
export async function registerDriver(data) {
  // MOCK hasta backend
  return { ok: true };
}
