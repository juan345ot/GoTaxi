import http from './httpClient';

// Solicitar viaje: POST /api/trips
export async function requestRide(origin, destination, paymentMethod) {
  // El backend espera:
  // - origen: { direccion, lat, lng }
  // - destino: { direccion, lat, lng }
  // - tarifa, distancia_km, duracion_min, metodoPago
  
  // Calcular distancia y duración estimadas (fórmula de Haversine simplificada)
  const calculateDistance = (origin, dest) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (dest.latitude - origin.latitude) * Math.PI / 180;
    const dLon = (dest.longitude - origin.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.latitude * Math.PI / 180) * Math.cos(dest.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  let distanceKm = calculateDistance(origin, destination);
  // Asegurar que la distancia sea al menos 0.1 km (100 metros)
  if (distanceKm < 0.1) {
    distanceKm = 0.1;
  }
  
  // Estimar duración: ~30 km/h promedio en ciudad, mínimo 5 minutos
  let durationMin = Math.round((distanceKm / 30) * 60);
  if (durationMin < 5) {
    durationMin = 5;
  }
  
  // Estimar tarifa: base 500 + 200 por km, mínimo 500
  let tarifa = Math.round(500 + (distanceKm * 200));
  if (tarifa < 500) {
    tarifa = 500;
  }

  const res = await http.post('/trips', {
    origen: {
      direccion: origin.address || origin,
      lat: origin.latitude,
      lng: origin.longitude,
    },
    destino: {
      direccion: destination.address || destination,
      lat: destination.latitude,
      lng: destination.longitude,
    },
    tarifa,
    distancia_km: distanceKm,
    duracion_min: durationMin,
    metodoPago: paymentMethod,
  });
  
  // El backend devuelve { success: true, data: {...}, message: "..." }
  // Retornar el objeto del viaje que está en res.data.data
  if (res.data && res.data.success && res.data.data) {
    return res.data.data; // Info del viaje creado
  }
  // Fallback: si la estructura es diferente, retornar res.data completo
  return res.data;
}

// Obtener un viaje por ID: GET /api/trips/:id
export async function getRideById(rideId) {
  const res = await http.get(`/trips/${rideId}`);
  // El backend devuelve { success: true, data: {...} }
  if (res.data && res.data.success && res.data.data) {
    return res.data.data;
  }
  // Fallback: si la estructura es diferente, retornar res.data completo
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
