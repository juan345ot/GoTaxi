import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {{ user, login, logout, isAuthenticated }}
 */
export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}