import { useContextSelector } from './useContextSelector';
import { LocationContext } from '../contexts/LocationContext';

/**
 * Hook optimizado para acceder a propiedades específicas del LocationContext
 * Evita re-renders innecesarios cuando solo cambian partes específicas del contexto
 */

// Selectors básicos
export const useLocation = () => useContextSelector(LocationContext, state => state.location);
export const useLocationLoading = () => useContextSelector(LocationContext, state => state.loading);
export const useLocationError = () => useContextSelector(LocationContext, state => state.error);
export const useLocationPermissionStatus = () => useContextSelector(LocationContext, state => state.permissionStatus);

// Selectors derivados
export const useLocationCoordinates = () => useContextSelector(LocationContext, state => state.coordinates);
export const useLocationAccuracy = () => useContextSelector(LocationContext, state => state.accuracy);
export const useLocationTimestamp = () => useContextSelector(LocationContext, state => state.timestamp);

// Selectors de estado
export const useLocationHasLocation = () => useContextSelector(LocationContext, state => state.hasLocation);
export const useLocationHasError = () => useContextSelector(LocationContext, state => state.hasError);
export const useLocationIsPermissionGranted = () => useContextSelector(LocationContext, state => state.isPermissionGranted);
export const useLocationIsPermissionDenied = () => useContextSelector(LocationContext, state => state.isPermissionDenied);
export const useLocationIsLoading = () => useContextSelector(LocationContext, state => state.isLocationLoading);

// Selector combinado para casos comunes
export const useLocationState = () => useContextSelector(LocationContext, state => ({
  location: state.location,
  loading: state.loading,
  error: state.error,
  permissionStatus: state.permissionStatus,
}));

// Selector para información de ubicación
export const useLocationInfo = () => useContextSelector(LocationContext, state => ({
  hasLocation: state.hasLocation,
  hasError: state.hasError,
  isPermissionGranted: state.isPermissionGranted,
  isPermissionDenied: state.isPermissionDenied,
  isLoading: state.isLocationLoading,
  coordinates: state.coordinates,
  accuracy: state.accuracy,
  timestamp: state.timestamp,
}));

// Selectors de funciones
export const useLocationActions = () => useContextSelector(LocationContext, state => ({
  reloadLocation: state.reloadLocation,
  clearLocation: state.clearLocation,
  clearError: state.clearError,
}));

// Selector para validación de ubicación
export const useLocationValidation = () => useContextSelector(LocationContext, state => ({
  isValid: state.hasLocation && !state.hasError && state.isPermissionGranted,
  canRequestLocation: !state.isLoading && state.permissionStatus !== 'denied',
  needsPermission: state.permissionStatus === null || state.permissionStatus === 'undetermined',
}));

export default {
  useLocation,
  useLocationLoading,
  useLocationError,
  useLocationPermissionStatus,
  useLocationCoordinates,
  useLocationAccuracy,
  useLocationTimestamp,
  useLocationHasLocation,
  useLocationHasError,
  useLocationIsPermissionGranted,
  useLocationIsPermissionDenied,
  useLocationIsLoading,
  useLocationState,
  useLocationInfo,
  useLocationActions,
  useLocationValidation,
};
