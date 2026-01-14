import http from './httpClient';

// Perfil del usuario logueado
export async function getProfile() {
  const res = await http.get('/users/me');
  // El backend devuelve { success: true, data: {...}, message: '...' }
  // Retornar data directamente para compatibilidad
  return res.data?.data || res.data;
}

// Actualizar perfil (PUT /api/users/profile o PUT /api/users/me)
export async function updateProfile(form) {
  // Intentar primero con /profile, si falla usar /me
  try {
    const res = await http.put('/users/profile', form);
    return res.data;
  } catch (error) {
    // Fallback a /me si /profile no existe
    const res = await http.put('/users/me', form);
    return res.data;
  }
}

// Actualizar password (PUT /api/users/password - más confiable que /me/password)
export async function updatePassword(form) {
  try {
    const res = await http.put('/users/password', form);
    return res.data;
  } catch (error) {
    // Fallback a /me/password si /password no funciona
    const res = await http.put('/users/me/password', form);
    return res.data;
  }
}

// ===== Direcciones =====

// Obtener todas las direcciones del usuario
export async function getAddresses() {
  const res = await http.get('/users/me/addresses');
  // El backend devuelve { success: true, data: [...], message: '...' }
  return res.data?.data || res.data || [];
}

// Obtener una dirección por ID
export async function getAddressById(addressId) {
  const res = await http.get(`/users/me/addresses/${addressId}`);
  return res.data;
}

// Crear una nueva dirección
export async function createAddress(addressData) {
  const res = await http.post('/users/me/addresses', addressData);
  // El backend devuelve { success: true, data: {...}, message: '...' }
  return res.data?.data || res.data;
}

// Actualizar una dirección existente
export async function updateAddress(addressId, addressData) {
  const res = await http.put(`/users/me/addresses/${addressId}`, addressData);
  return res.data;
}

// Eliminar una dirección
export async function deleteAddress(addressId) {
  const res = await http.delete(`/users/me/addresses/${addressId}`);
  return res.data;
}
