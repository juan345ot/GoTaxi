import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import BookingStatus from '../../components/booking/BookingStatus';
import MapPreview from '../../components/map/MapPreview';
import useMap from '../../hooks/useMap';

export default function RideTrackingScreen({ route }) {
  const { origin, destination } = route.params;
  const { location } = useMap();

  const region = location || {
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const markers = [
    {
      coordinate: region,
      title: 'Tu ubicación',
    },
    {
      coordinate: {
        latitude: region.latitude + 0.003,
        longitude: region.longitude + 0.003,
      },
      title: 'Conductor',
    },
  ];

  return (
    <View style={styles.container}>
      <BookingStatus status="camino" />
      <MapPreview region={region} markers={markers} />
      <Text style={styles.info}>Conductor: Juan M. - Toyota Etios Blanco</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  info: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
});
