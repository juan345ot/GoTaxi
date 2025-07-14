import React, { createContext, useContext, useState } from 'react';

// Estructura de viaje (puede expandirse)
const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [trips, setTrips] = useState([]);

  // Guardar nuevo viaje
  function addTrip(tripData) {
    setTrips((prev) => [
      {
        id: Date.now().toString(),
        ...tripData,
        fecha: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  // (Opcional) limpiar historial
  function clearTrips() {
    setTrips([]);
  }

  return (
    <HistoryContext.Provider value={{ trips, addTrip, clearTrips }}>
      {children}
    </HistoryContext.Provider>
  );
}

// Hook para consumir el contexto
export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory debe usarse dentro de un HistoryProvider');
  return ctx;
}
