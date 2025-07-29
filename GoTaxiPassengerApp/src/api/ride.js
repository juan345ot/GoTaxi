import http from './httpClient';

// Solicitar viaje: POST /api/rides
export async function requestRide(origin, destination, paymentMethod) {
  const res = await http.post('/rides', {
    origin,
    destination,
    paymentMethod,
  });
  return res.data; // Info del viaje creado
}

// Obtener un viaje por ID: GET /api/rides/:id
export async function getRideById(rideId) {
  const res = await http.get(`/rides/${rideId}`);
  return res.data;
}

// Cancelar viaje: POST /api/rides/:id/cancel
export async function cancelRide(rideId) {
  const res = await http.post(`/rides/${rideId}/cancel`);
  return res.data;
}

// Confirmar pago: POST /api/rides/:id/pay
export async function payForRide(rideId, paymentMethod) {
  const res = await http.post(`/rides/${rideId}/pay`, { paymentMethod });
  return res.data;
}

// Calificar viaje: POST /api/rides/:id/rate
export async function rateRide(rideId, rating, comment) {
  const res = await http.post(`/rides/${rideId}/rate`, { rating, comment });
  return res.data;
}

// Listar viajes del usuario actual: GET /api/rides
export async function getUserRides() {
  const res = await http.get('/rides');
  return res.data;
}
