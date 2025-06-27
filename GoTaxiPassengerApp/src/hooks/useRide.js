import { useState } from 'react';
import { showToast } from '../utils/toast';

/**
 * Hook para gestionar viajes (solicitar, cancelar, seguir)
 */
export default function useRide() {
  const [rideData, setRideData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestRide = async (origin, destination) => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de viaje solicitado
      await new Promise((res) => setTimeout(res, 1000));
      const mockRide = {
        id: Date.now(),
        origin,
        destination,
        driver: 'Juan M.',
        vehicle: 'Toyota Etios Blanco',
        status: 'camino',
      };
      setRideData(mockRide);
      showToast('Viaje solicitado');
    } catch (err) {
      setError('Error al solicitar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const trackCurrentRide = () => {
    // Simula seguimiento
    setTrackingInfo({
      driverPosition: {
        latitude: -34.602,
        longitude: -58.384,
      },
      status: 'camino',
    });
  };

  const cancelRide = () => {
    setRideData(null);
    setTrackingInfo(null);
    showToast('Viaje cancelado');
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