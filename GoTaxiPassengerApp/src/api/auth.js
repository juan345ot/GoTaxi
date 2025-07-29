import http from './httpClient';

// Login: POST /api/auth/login
export async function login(email, password) {
  const res = await http.post('/auth/login', { email, password });
  return res.data; // { user, token }
}

// Registro: POST /api/auth/register
export async function register(form) {
  // form: { name, lastname, dni, birthdate, email, password, address, city, province, country }
  const res = await http.post('/auth/register', form);
  return res.data; // { user, token }
}

// Perfil actual: GET /api/users/me
export async function getProfile() {
  const res = await http.get('/users/me');
  return res.data;
}
