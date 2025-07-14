import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';

export default function RideTrackingScreen({ route, navigation }) {
  // Simulación: origen y destino fijos, taxi va interpolando entre ambos
  const {
    origin = { latitude: -34.61, longitude: -58.38 },
    destination = { latitude: -34.62, longitude: -58.44 },
    driver,
    vehicle,
  } = route.params || {};

  const [taxiPosition, setTaxiPosition] = useState(origin);
  const [progress, setProgress] = useState(0);
  const [estado, setEstado] = useState('esperandoTaxi'); // "esperandoTaxi", "confirmarSubida", "enCurso"
  const [usuarioArriba, setUsuarioArriba] = useState(false);

  // Simula animación de taxi hasta la partida (progreso < 0.2), luego espera confirmación, después avanza a destino
  useEffect(() => {
    if (estado === 'esperandoTaxi' && progress < 0.2) {
      const timer = setTimeout(() => setProgress((p) => Math.min(0.2, p + 0.018)), 100);
      setTaxiPosition({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
      });
      if (progress >= 0.2) setEstado('confirmarSubida');
      return () => clearTimeout(timer);
    }
    if (estado === 'enCurso' && progress < 1) {
      const timer = setTimeout(() => setProgress((p) => Math.min(1, p + 0.014)), 110);
      setTaxiPosition({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
      });
      if (progress >= 1) {
        // Llegó a destino: ir al resumen (puede recibir los datos por route)
        navigation.replace('TripSummary', {
          origin,
          destination,
          distancia: 3200, // simulado, podés calcularlo real
          duration: 15, // simulado
          driver,
          vehicle,
        });
      }
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [estado, progress, origin, destination]);

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

  // Cuando usuario confirma que subió, arranca el viaje real
  const handleConfirmarSubida = () => {
    setUsuarioArriba(true);
    setEstado('enCurso');
    setProgress(0.21); // inicia después de la partida
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
        {estado === 'esperandoTaxi' && (
          <Text style={styles.estado}>El taxi está llegando a tu ubicación...</Text>
        )}
        {estado === 'confirmarSubida' && !usuarioArriba && (
          <>
            <Text style={styles.estadoBold}>¡El taxi llegó!</Text>
            <TouchableOpacity style={styles.btnSubi} onPress={handleConfirmarSubida}>
              <Text style={styles.btnSubiText}>Confirmar que subí</Text>
            </TouchableOpacity>
            <Text style={styles.estado}>Avisale al conductor que ya estás arriba para comenzar el viaje.</Text>
          </>
        )}
        {estado === 'enCurso' && (
          <Text style={styles.estado}>Tu viaje está en curso...</Text>
        )}
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
  estadoBold: {
    marginTop: 8,
    fontSize: 16,
    color: '#007aff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  btnSubi: {
    marginTop: 14,
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 33,
    elevation: 4,
  },
  btnSubiText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
