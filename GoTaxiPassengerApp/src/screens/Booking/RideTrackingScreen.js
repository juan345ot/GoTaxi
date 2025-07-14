import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';

export default function RideTrackingScreen({ route, navigation }) {
  // Simulación: origen y destino fijos, taxi va interpolando entre ambos
  const { origin = { latitude: -34.61, longitude: -58.38 }, destination = { latitude: -34.62, longitude: -58.44 }, driver, vehicle } = route.params || {};
  const [taxiPosition, setTaxiPosition] = useState(origin);
  const [progress, setProgress] = useState(0);

  // Simula animación de taxi avanzando hacia destino
  useEffect(() => {
    if (progress >= 1) return;
    const timer = setTimeout(() => {
      setProgress((p) => Math.min(1, p + 0.015));
    }, 120);
    setTaxiPosition({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
    });
    return () => clearTimeout(timer);
  }, [progress, origin, destination]);

  const handleSOS = () => {
    Alert.alert('Emergencia', '¿Deseás llamar a tus contactos de emergencia?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar', onPress: () => Alert.alert('Llamando... (simulado)') },
    ]);
  };

  const handleShare = () => {
    Alert.alert('Compartir viaje', 'Se envió tu ubicación y ruta a tu contacto (simulado)');
  };

  const handleChat = () => {
    Alert.alert('Chat', 'Función de chat con el conductor (simulada)');
  };

  const handleCall = () => {
    Alert.alert('Llamar', 'Llamando al conductor (simulado)');
  };

  return (
    <View style={styles.container}>
      <TaxiMap
        origin={origin}
        destination={destination}
        taxiPosition={taxiPosition}
        onPressSOS={handleSOS}
        onPressShare={handleShare}
        onPressChat={handleChat}
        onPressCall={handleCall}
        chatEnabled={true}
        callEnabled={true}
      />
      <View style={styles.infoBox}>
        <DriverInfoCard driver={driver} vehicle={vehicle} />
        <Text style={styles.estado}>El taxi está yendo a tu ubicación...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  infoBox: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estado: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
});
