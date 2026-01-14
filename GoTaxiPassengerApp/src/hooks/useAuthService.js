import { useMemo } from 'react';
import AuthService from '../services/AuthService';
import AuthRepository from '../infrastructure/repositories/AuthRepository';
import { axiosInstance } from '../api/axiosInstance';

/**
 * Custom hook to provide access to AuthService instance
 * @returns {AuthService} AuthService instance
 */
export const useAuthService = () => {
  const authService = useMemo(() => {
    const authRepository = new AuthRepository(axiosInstance);
    return new AuthService(authRepository);
  }, []);

  return authService;
};
