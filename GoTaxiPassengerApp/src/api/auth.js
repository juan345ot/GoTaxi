import http from './httpClient';

// POST /api/auth/login  => { token, user }
export async function login(email, password) {
  const { data } = await http.post('/auth/login', { email, password });
  return data;
}

// POST /api/auth/register => { message, user? }
export async function register(payload) {
  const { data } = await http.post('/auth/register', payload);
  return data;
}

// GET /api/users/me => { user }
export async function profile() {
  const { data } = await http.get('/users/me');
  return data;
}
