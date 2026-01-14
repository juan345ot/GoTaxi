import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { showToast } from '../utils/toast';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const getLocation = useCallback(async() => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        setLocation(null);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 segundos
        timeout: 15000, // 15 segundos
      });

      const newLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        accuracy: coords.accuracy,
        timestamp: coords.timestamp,
      };

      setLocation(newLocation);
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener ubicación';
      setError(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoizar selectors para evitar re-renders innecesarios
  const locationSelectors = useMemo(() => ({
    hasLocation: !!location,
    hasError: !!error,
    isPermissionGranted: permissionStatus === 'granted',
    isPermissionDenied: permissionStatus === 'denied',
    isLocationLoading: loading,
    coordinates: location ? {
      latitude: location.latitude,
      longitude: location.longitude,
    } : null,
    accuracy: location?.accuracy || null,
    timestamp: location?.timestamp || null,
  }), [location, error, permissionStatus, loading]);

  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    // Estado básico
    location,
    loading,
    error,
    permissionStatus,

    // Selectors
    ...locationSelectors,

    // Funciones
    reloadLocation: getLocation,
    clearLocation,
    clearError,
  }), [location, loading, error, permissionStatus, locationSelectors, getLocation, clearLocation, clearError]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    // Retornar valores por defecto si el contexto no está disponible
    console.warn('useLocationContext debe usarse dentro de LocationProvider');
    return {
      location: null,
      loading: false,
      error: null,
      permissionStatus: null,
      hasLocation: false,
      hasError: false,
      isPermissionGranted: false,
      isPermissionDenied: false,
      isLocationLoading: false,
      coordinates: null,
      accuracy: null,
      timestamp: null,
      reloadLocation: async() => {},
      clearLocation: () => {},
      clearError: () => {},
    };
  }
  return context;
};
