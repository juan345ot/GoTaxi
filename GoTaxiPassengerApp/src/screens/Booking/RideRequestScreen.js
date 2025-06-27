import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function RideTrackingScreen({ route }) {
  const { origin, destination } = route.params;

  const [region, setRegion] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Opcional: ajustar el mapa con datos reales de origen y destino más adelante

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento del Viaje</Text>

      <MapView style={styles.map} region={region} showsUserLocation>
        <Marker coordinate={{ latitude: -34.6037, longitude: -58.3816 }} title="Tu posición" />
        {/* Se puede agregar Marker para destino si tenés coordenadas */}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.9,
  },
});
