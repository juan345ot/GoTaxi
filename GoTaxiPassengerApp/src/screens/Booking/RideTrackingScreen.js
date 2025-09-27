import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';
import i18n from '../../translations';
import * as rideApi from '../../api/ride';
import { showToast } from '../../utils/toast';

export default function RideTrackingScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taxiPosition, setTaxiPosition] = useState(null);
  const wsRef = useRef(null);

  // 1. Polling REST cada 3 segs
  useEffect(() => {
    let interval;
    const fetchRide = async () => {
      try {
        const data = await rideApi.getRideById(rideId);
        setRide(data);
        if (data.status === 'completed') {
          navigation.replace('TripSummary', {
            ...data
          });
        }
        if (data.status === 'cancelled') {
          navigation.replace('TripSummary', {
            ...data,
            cancelado: true
          });
        }
      } catch (e) {
        setRide(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
    interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  // 2. Simulación del movimiento del taxi
  useEffect(() => {
    if (!ride || !ride.origen || !ride.destino) return;

    const startLat = ride.origen.lat;
    const startLng = ride.origen.lng;
    const endLat = ride.destino.lat;
    const endLng = ride.destino.lng;

    // Simular posición inicial del taxi (cerca del origen)
    const initialTaxiLat = startLat + (Math.random() - 0.5) * 0.01;
    const initialTaxiLng = startLng + (Math.random() - 0.5) * 0.01;
    setTaxiPosition({ latitude: initialTaxiLat, longitude: initialTaxiLng });

    // Simular movimiento del taxi hacia el destino
    let progress = 0;
    const moveTaxi = () => {
      if (progress >= 1) return;
      
      progress += 0.02; // Incremento del progreso
      if (progress > 1) progress = 1;

      // Interpolación lineal entre origen y destino
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;
      
      setTaxiPosition({ latitude: currentLat, longitude: currentLng });
    };

    const taxiInterval = setInterval(moveTaxi, 1000); // Mover cada segundo
    return () => clearInterval(taxiInterval);
  }, [ride]);

  // 2. WebSocket para actualizaciones instantáneas (opcional)
  // Si querés, podés sumar esto después usando el socketURL del backend

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />;
  if (!ride) return <Text style={{ textAlign: 'center', marginTop: 60 }}>No se encontró el viaje.</Text>;

  // Mapear la info para el mapa y la UI con valores por defecto
  const { 
    origen = { direccion: 'Origen no disponible' }, 
    destino = { direccion: 'Destino no disponible' }, 
    driver = null, 
    vehicle = 'Vehículo no disponible', 
    status = 'requested' 
  } = ride;
  
  // Convertir origen/destino a formato de coordenadas para el mapa
  const origin = origen.lat && origen.lng ? { latitude: origen.lat, longitude: origen.lng } : null;
  const destination = destino.lat && destino.lng ? { latitude: destino.lat, longitude: destino.lng } : null;

  return (
    <View style={styles.container}>
      <TaxiMap
        origin={origin}
        destination={destination}
        taxiPosition={taxiPosition}
        onPressSOS={() => {
          showToast('SOS activado - Enviando ubicación de emergencia');
        }}
        onPressShare={() => {
          showToast('Compartiendo ubicación del viaje');
        }}
        onPressChat={() => {
          navigation.navigate('Chat', { rideId });
        }}
        onPressCall={() => {
          showToast('Llamando al conductor...');
        }}
        chatEnabled={true}
        callEnabled={true}
      />
      <View style={styles.infoBox}>
        <DriverInfoCard driver={driver} vehicle={vehicle} />
        <Text style={styles.estado}>
          {status === 'requested' && i18n.t('taxi_on_the_way')}
          {status === 'accepted' && i18n.t('taxi_on_the_way')}
          {status === 'in_progress' && i18n.t('trip_in_progress')}
          {status === 'completed' && i18n.t('trip_arrived_title')}
          {status === 'cancelled' && i18n.t('trip_cancelled_title')}
        </Text>
      </View>
      {/* Aquí van los botones SOS, Compartir, Cancelar, etc. */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          Alert.alert(
            i18n.t('cancel_trip_btn'),
            i18n.t('cancel_warning_dialog', { fine: 500 }),
            [
              { text: i18n.t('no'), style: 'cancel' },
              {
                text: i18n.t('yes_cancel'),
                style: 'destructive',
                onPress: async () => {
                  await rideApi.cancelRide(rideId);
                  navigation.replace('TripSummary', { ...ride, cancelado: true });
                }
              }
            ]
          );
        }}
      >
        <Text style={styles.cancelBtnText}>{i18n.t('cancel_trip_btn')}</Text>
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
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 34,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#e53935',
    minHeight: 48,
  },
  cancelBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
