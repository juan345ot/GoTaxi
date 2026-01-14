import { useMemo } from 'react';
import TripService from '../services/TripService';
import TripRepository from '../infrastructure/repositories/TripRepository';
import { axiosInstance } from '../api/axiosInstance';

/**
 * Custom hook to provide access to TripService instance
 * @returns {TripService} TripService instance
 */
export const useTripService = () => {
  const tripService = useMemo(() => {
    const tripRepository = new TripRepository(axiosInstance);
    return new TripService(tripRepository);
  }, []);

  return tripService;
};
