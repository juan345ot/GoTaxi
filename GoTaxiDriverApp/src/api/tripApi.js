export const getTripRequests = async () => {
  // Aquí harás el fetch a la API real cuando esté lista
  // Por ahora mock
  return [
    { id: '1', origen: 'Calle 9 y 23', destino: 'Hospital Municipal', pasajero: 'Carlos Díaz', rating: 4.8, motivo: 'Turno médico', monto: 1200 }
    // ...más viajes
  ];
};

export const acceptTrip = async (tripId) => {
  // Integrar con backend real a futuro
  return { success: true };
};

export const rejectTrip = async (tripId) => {
  // Integrar con backend real a futuro
  return { success: true };
};
