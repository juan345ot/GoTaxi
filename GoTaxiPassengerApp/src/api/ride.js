import http from './httpClient';

// Solicitar viaje: POST /api/trips
export async function requestRide(origin, destination, paymentMethod) {
  const res = await http.post('/trips', {
    origen: origin,
    destino: destination,
    metodoPago: paymentMethod,
  });
  return res.data; // Info del viaje creado
}

// Obtener un viaje por ID: GET /api/trips/:id
export async function getRideById(rideId) {
  const res = await http.get(`/trips/${rideId}`);
  return res.data;
}

// Cancelar viaje: POST /api/trips/:id/cancel
export async function cancelRide(rideId) {
  const res = await http.post(`/trips/${rideId}/cancel`);
  return res.data;
}

// Confirmar pago: POST /api/trips/:id/pay
export async function payForRide(rideId, paymentMethod) {
  const res = await http.post(`/trips/${rideId}/pay`, { paymentMethod });
  return res.data;
}

// Calificar viaje: POST /api/trips/:id/rate
export async function rateRide(rideId, rating, comment) {
  const res = await http.post(`/trips/${rideId}/rate`, { rating, comment });
  return res.data;
}

// Listar viajes del usuario actual: GET /api/trips
export async function getUserRides() {
  const res = await http.get('/trips');
  return res.data;
}
