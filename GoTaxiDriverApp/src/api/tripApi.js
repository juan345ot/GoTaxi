import axios from './axiosInstance';

/** Obtener solicitudes */
export async function getTripRequests() {
  // MOCK
  return [
    { id: '1', origen: 'Plaza', destino: 'Hospital', pasajero: 'Juan', rating: 4.5, motivo: 'Consulta médica', monto: 1200 }
  ];
}

/** Aceptar viaje */
export async function acceptTrip(tripId) {
  return { ok: true };
}

/** Rechazar viaje */
export async function rejectTrip(tripId) {
  return { ok: true };
}
/** Finalizar viaje */
export async function finishTrip(tripId) {
  return { ok: true };
}
