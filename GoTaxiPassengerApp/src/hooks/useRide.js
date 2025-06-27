import { useState } from 'react';
import { requestRide, trackRide } from '../services/rideService';

export default function useRide() {
  const [rideData, setRideData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRide = async (origin, destination, user) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestRide({ origin, destination, user });
      setRideData(response);
      return response;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const trackCurrentRide = async (rideId) => {
    try {
      const info = await trackRide(rideId);
      setTrackingInfo(info);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    rideData,
    trackingInfo,
    loading,
    error,
    createRide,
    trackCurrentRide,
  };
}
