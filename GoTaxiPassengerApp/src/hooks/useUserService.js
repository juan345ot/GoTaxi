import { useMemo } from 'react';
import UserService from '../services/UserService';
import UserRepository from '../infrastructure/repositories/UserRepository';
import { axiosInstance } from '../api/axiosInstance';

/**
 * Custom hook to provide access to UserService instance
 * @returns {UserService} UserService instance
 */
export const useUserService = () => {
  const userService = useMemo(() => {
    const userRepository = new UserRepository(axiosInstance);
    return new UserService(userRepository);
  }, []);

  return userService;
};
