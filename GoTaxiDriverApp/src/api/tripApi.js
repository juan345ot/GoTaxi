import http from './http'; // Asumiendo que existe un cliente HTTP configurado

// Obtener viajes solicitados (pendientes de confirmación para este conductor)
// En el nuevo flujo, el conductor recibe propuestas directa vía socket o consulta viajes "esperando_confirmacion" asignados a él
export async function getTripRequests() {
  try {
    // Buscar viajes donde el estado sea 'esperando_confirmacion' y el conductor sea el usuario actual
    const response = await http.get('/trips/driver/pending'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching trip requests:', error);
    return [];
  }
}

// Aceptar viaje
export async function acceptTrip(tripId) {
  try {
    const response = await http.put(`/trips/${tripId}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error accepting trip:', error);
    throw error;
  }
}

// Rechazar viaje
export async function rejectTrip(tripId) {
  try {
    const response = await http.put(`/trips/${tripId}/reject-as-driver`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting trip:', error);
    throw error;
  }
}

// Obtener viaje actual
export async function getCurrentTrip() {
  try {
    const response = await http.get('/trips/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current trip:', error);
    return null;
  }
}

// Obtener detalles de un viaje específico
export async function getTripById(tripId) {
  try {
    const response = await http.get(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
}

// Actualizar estado del viaje
export async function updateTripStatus(tripId, status) {
  try {
    const response = await http.put(`/trips/${tripId}/status`, { estado: status });
    return response.data;
  } catch (error) {
    console.error('Error updating trip status:', error);
    throw error;
  }
}
