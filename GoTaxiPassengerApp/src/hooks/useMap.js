import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function useMap() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getCurrentLocation = async() => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, error, reload: getCurrentLocation };
}
