import { useContextSelector } from './useContextSelector';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook optimizado para acceder a propiedades específicas del AuthContext
 * Evita re-renders innecesarios cuando solo cambian partes específicas del contexto
 */

// Selectors básicos
export const useAuthUser = () => useContextSelector(AuthContext, state => state.user);
export const useAuthLoading = () => useContextSelector(AuthContext, state => state.loading);
export const useAuthInitializing = () => useContextSelector(AuthContext, state => state.initializing);
export const useAuthIsAuthenticated = () => useContextSelector(AuthContext, state => state.isAuthenticated);

// Selectors derivados
export const useAuthUserInfo = () => useContextSelector(AuthContext, state => ({
  id: state.user?.id,
  name: state.user?.name,
  email: state.user?.email,
  role: state.user?.role,
  isActive: state.user?.isActive,
}));

export const useAuthUserProfile = () => useContextSelector(AuthContext, state => ({
  fullName: state.user ? `${state.user.name || ''} ${state.user.lastname || ''}`.trim() : '',
  email: state.user?.email,
  phone: state.user?.phone,
  avatar: state.user?.avatar,
}));

export const useAuthUserRole = () => useContextSelector(AuthContext, state => ({
  role: state.user?.role,
  isPassenger: state.user?.role === 'pasajero',
  isDriver: state.user?.role === 'conductor',
  isAdmin: state.user?.role === 'admin',
}));

export const useAuthUserStatus = () => useContextSelector(AuthContext, state => ({
  isActive: state.user?.isActive,
  isVerified: state.user?.isVerified,
  canPerformActions: state.user?.isActive && state.user?.isVerified,
}));

// Selectors de funciones
export const useAuthActions = () => useContextSelector(AuthContext, state => ({
  login: state.login,
  logout: state.logout,
  register: state.register,
}));

// Selector combinado para casos comunes
export const useAuthState = () => useContextSelector(AuthContext, state => ({
  user: state.user,
  loading: state.loading,
  initializing: state.initializing,
  isAuthenticated: state.isAuthenticated,
}));

// Selector para información de sesión
export const useAuthSession = () => useContextSelector(AuthContext, state => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.loading,
  isInitializing: state.initializing,
  hasUser: !!state.user,
}));

export default {
  useAuthUser,
  useAuthLoading,
  useAuthInitializing,
  useAuthIsAuthenticated,
  useAuthUserInfo,
  useAuthUserProfile,
  useAuthUserRole,
  useAuthUserStatus,
  useAuthActions,
  useAuthState,
  useAuthSession,
};
