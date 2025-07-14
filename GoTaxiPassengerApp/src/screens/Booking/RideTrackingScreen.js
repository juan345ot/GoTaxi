import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';

const MULTA_BEFORE = 500; // Antes de confirmar subida
const MULTA_AFTER = 1500; // Después de confirmar subida

export default function RideTrackingScreen({ route, navigation }) {
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
  const [cancelando, setCancelando] = useState(false);

  // Simula animación taxi → partida y luego viaje real
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
        navigation.replace('TripSummary', {
          origin,
          destination,
          distancia: 3200, // simulado
          duration: 15,
          driver,
          vehicle,
        });
      }
      return () => clearTimeout(timer);
    }
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

  const handleConfirmarSubida = () => {
    setUsuarioArriba(true);
    setEstado('enCurso');
    setProgress(0.21);
  };

  // NUEVO: lógica para cancelar viaje con advertencia y multa
  const handleCancelar = () => {
    const multa = estado === 'enCurso' ? MULTA_AFTER : MULTA_BEFORE;
    setCancelando(true);
    Alert.alert(
      '¿Seguro que querés cancelar el viaje?',
      `Cancelar ahora implicará una multa de $${multa}. ¿Deseás continuar?`,
      [
        { text: 'No', style: 'cancel', onPress: () => setCancelando(false) },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            setCancelando(false);
            navigation.replace('TripSummary', {
              origin,
              destination,
              driver,
              vehicle,
              distancia: 0,
              duration: 0,
              multa,
              cancelado: true,
            });
          }
        }
      ]
    );
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
      <TouchableOpacity
        style={[styles.cancelBtn, cancelando && { opacity: 0.4 }]}
        onPress={handleCancelar}
        disabled={cancelando}
      >
        <Text style={styles.cancelBtnText}>Cancelar viaje</Text>
      </TouchableOpacity>
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
  cancelBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  cancelBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
