// src/hooks/useRide.js
import { useState } from 'react';
import { showToast } from '../utils/toast';
import * as rideApi from '../api/ride'; // API para consumir /api/trips del backend

/**
 * Hook para gestionar viajes (solicitar, cancelar, seguir) REAL
 */
export default function useRide() {
  const [rideData, setRideData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestRide = async (origin, destination, paymentMethod) => {
    setLoading(true);
    setError(null);
    try {
      // Aquí va la llamada real a la API de tu backend
      const newRide = await rideApi.requestRide(origin, destination, paymentMethod);
      setRideData(newRide);
      showToast('Viaje solicitado');
      return newRide; // Retornar el viaje creado
    } catch (err) {
      setError('Error al solicitar el viaje');
      showToast('Error al solicitar el viaje');
      throw err; // Re-lanzar el error para que se pueda manejar en el componente
    } finally {
      setLoading(false);
    }
  };

  const trackCurrentRide = async (rideId) => {
    setLoading(true);
    setError(null);
    try {
      const tracking = await rideApi.getTracking(rideId);
      setTrackingInfo(tracking);
    } catch (err) {
      setError('Error al obtener tracking');
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (rideId) => {
    setLoading(true);
    try {
      await rideApi.cancelRide(rideId);
      setRideData(null);
      setTrackingInfo(null);
      showToast('Viaje cancelado');
    } catch (err) {
      setError('Error al cancelar el viaje');
      showToast('Error al cancelar el viaje');
    } finally {
      setLoading(false);
    }
  };

  return {
    rideData,
    trackingInfo,
    loading,
    error,
    requestRide,
    trackCurrentRide,
    cancelRide,
  };
}
