import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { trackRide } from '../../services/rideService';

export default function RideTrackingScreen({ route }) {
  const { origin, destination, user, currentLocation } = route.params;
  const [driver, setDriver] = useState(null);
  const [status, setStatus] = useState('Buscando conductor...');
  const [region, setRegion] = useState({
    latitude: currentLocation?.latitude || -34.6037,
    longitude: currentLocation?.longitude || -58.3816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    const fetchTracking = async () => {
      const data = await trackRide();
      setDriver(data.driver);
      setStatus(data.status);
    };
    fetchTracking();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento del Viaje</Text>
      <Text style={styles.subtitle}>{status}</Text>
      {driver && (
        <View style={styles.infoBox}>
          <Text>Conductor: {driver.name}</Text>
          <Text>Vehículo: {driver.car}</Text>
        </View>
      )}

      <MapView style={styles.map} region={region} showsUserLocation>
        <Marker coordinate={region} title="Tu ubicación" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, textAlign: 'center', marginTop: 10 },
  subtitle: { textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
  infoBox: { padding: 12, backgroundColor: '#f0f0f0', margin: 12, borderRadius: 8 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.75,
  },
});
