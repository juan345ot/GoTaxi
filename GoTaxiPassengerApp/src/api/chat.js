import http from './httpClient';

// Obtener mensajes del viaje: GET /api/trips/:id/messages
export async function getMessages(rideId) {
  const res = await http.get(`/trips/${rideId}/messages`);
  return res.data; // Array de mensajes
}

// Enviar mensaje: POST /api/trips/:id/messages
export async function sendMessage(rideId, text) {
  const res = await http.post(`/trips/${rideId}/messages`, { text });
  return res.data;
}
