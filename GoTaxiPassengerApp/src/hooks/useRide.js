// src/hooks/useRide.js
import { useState, useCallback, useMemo } from 'react';
import { showToast } from '../utils/toast';
import * as rideApi from '../api/ride'; // API para consumir /api/trips del backend

/**
 * Hook para gestionar viajes (solicitar, cancelar, seguir) REAL
 * Optimizado con useCallback y useMemo para evitar re-renders innecesarios
 */
export default function useRide() {
  const [rideData, setRideData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestRide = useCallback(async(origin, destination, paymentMethod) => {
    setLoading(true);
    setError(null);
    try {
      // Aquí va la llamada real a la API de tu backend
      const newRide = await rideApi.requestRide(origin, destination, paymentMethod);
      setRideData(newRide);
      showToast('Viaje solicitado');
      return newRide; // Retornar el viaje creado
    } catch (err) {
      // Error en requestRide - handled by error handler
      const errorMessage = err?.message || 'Error al solicitar el viaje';
      setError(errorMessage);
      showToast(errorMessage);
      throw err; // Re-lanzar el error para que se pueda manejar en el componente
    } finally {
      setLoading(false);
    }
  }, []);

  const trackCurrentRide = useCallback(async(rideId) => {
    if (!rideId) {
      setError('ID de viaje requerido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tracking = await rideApi.getTracking(rideId);
      setTrackingInfo(tracking);
    } catch (err) {
      const errorMessage = err?.message || 'Error al obtener tracking';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelRide = useCallback(async(rideId) => {
    if (!rideId) {
      setError('ID de viaje requerido');
      return;
    }

    setLoading(true);
    try {
      await rideApi.cancelRide(rideId);
      setRideData(null);
      setTrackingInfo(null);
      showToast('Viaje cancelado');
    } catch (err) {
      const errorMessage = err?.message || 'Error al cancelar el viaje';
      setError(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoizar el estado del viaje para evitar re-renders innecesarios
  const rideStatus = useMemo(() => {
    if (!rideData) return 'idle';
    return rideData.status || 'unknown';
  }, [rideData]);

  // Memoizar si hay un viaje activo
  const hasActiveRide = useMemo(() => {
    return rideData && ['requested', 'accepted', 'in_progress'].includes(rideStatus);
  }, [rideData, rideStatus]);

  return {
    rideData,
    trackingInfo,
    loading,
    error,
    rideStatus,
    hasActiveRide,
    requestRide,
    trackCurrentRide,
    cancelRide,
  };
}
