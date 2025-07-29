import http from './httpClient';

// Enviar un reclamo/soporte
export async function sendSupportRequest(subject, message) {
  const res = await http.post('/support', { subject, message });
  return res.data;
}

// Obtener lista de reclamos del usuario
export async function getMySupportRequests() {
  const res = await http.get('/support/my');
  return res.data;
}

// Obtener un reclamo por ID
export async function getSupportRequestById(id) {
  const res = await http.get(`/support/${id}`);
  return res.data;
}

// Marcar un reclamo como resuelto
export async function resolveSupportRequest(id) {
  const res = await http.post(`/support/${id}/resolve`);
  return res.data;
}
