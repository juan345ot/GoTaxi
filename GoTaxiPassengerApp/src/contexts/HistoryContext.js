import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Estructura de viaje (puede expandirse)
const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guardar nuevo viaje
  const addTrip = useCallback((tripData) => {
    setTrips((prev) => [
      {
        id: Date.now().toString(),
        ...tripData,
        fecha: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  // Actualizar viaje existente
  const updateTrip = useCallback((tripId, updates) => {
    setTrips((prev) => prev.map(trip =>
      trip.id === tripId ? { ...trip, ...updates } : trip,
    ));
  }, []);

  // Eliminar viaje
  const removeTrip = useCallback((tripId) => {
    setTrips((prev) => prev.filter(trip => trip.id !== tripId));
  }, []);

  // Limpiar historial
  const clearTrips = useCallback(() => {
    setTrips([]);
  }, []);

  // Obtener viaje por ID
  const getTripById = useCallback((tripId) => {
    return trips.find(trip => trip.id === tripId);
  }, [trips]);

  // Obtener viajes por estado
  const getTripsByStatus = useCallback((status) => {
    return trips.filter(trip => trip.status === status);
  }, [trips]);

  // Obtener viajes por rango de fechas
  const getTripsByDateRange = useCallback((startDate, endDate) => {
    return trips.filter(trip => {
      const tripDate = new Date(trip.fecha);
      return tripDate >= startDate && tripDate <= endDate;
    });
  }, [trips]);

  // Memoizar selectors para evitar re-renders innecesarios
  const historySelectors = useMemo(() => ({
    totalTrips: trips.length,
    hasTrips: trips.length > 0,
    recentTrips: trips.slice(0, 5), // Últimos 5 viajes
    completedTrips: trips.filter(trip => trip.status === 'completed'),
    cancelledTrips: trips.filter(trip => trip.status === 'cancelled'),
    pendingTrips: trips.filter(trip => trip.status === 'pending'),
    totalSpent: trips
      .filter(trip => trip.status === 'completed' && trip.importe)
      .reduce((total, trip) => total + (parseFloat(trip.importe) || 0), 0),
    averageRating: trips
      .filter(trip => trip.rating && trip.rating > 0)
      .reduce((sum, trip) => sum + trip.rating, 0) /
      trips.filter(trip => trip.rating && trip.rating > 0).length || 0,
  }), [trips]);

  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    // Estado básico
    trips,
    loading,
    error,

    // Selectors
    ...historySelectors,

    // Funciones
    addTrip,
    updateTrip,
    removeTrip,
    clearTrips,
    getTripById,
    getTripsByStatus,
    getTripsByDateRange,
  }), [
    trips, loading, error, historySelectors, addTrip, updateTrip, removeTrip,
    clearTrips, getTripById, getTripsByStatus, getTripsByDateRange,
  ]);

  return (
    <HistoryContext.Provider value={contextValue}>
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
