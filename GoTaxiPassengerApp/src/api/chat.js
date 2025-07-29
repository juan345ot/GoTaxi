import http from './httpClient';

// Obtener mensajes del viaje: GET /api/rides/:id/messages
export async function getMessages(rideId) {
  const res = await http.get(`/rides/${rideId}/messages`);
  return res.data; // Array de mensajes
}

// Enviar mensaje: POST /api/rides/:id/messages
export async function sendMessage(rideId, text) {
  const res = await http.post(`/rides/${rideId}/messages`, { text });
  return res.data;
}
