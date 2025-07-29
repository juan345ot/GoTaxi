import http from './httpClient';

// Perfil del usuario logueado
export async function getProfile() {
  const res = await http.get('/users/me');
  return res.data;
}

// Actualizar perfil (PUT /api/users/me)
export async function updateProfile(form) {
  const res = await http.put('/users/me', form);
  return res.data;
}

// Actualizar password (PUT /api/users/me/password)
export async function updatePassword(form) {
  const res = await http.put('/users/me/password', form);
  return res.data;
}
