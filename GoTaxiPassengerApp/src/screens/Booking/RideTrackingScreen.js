import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';
import { t } from '../../translations';
import * as rideApi from '../../api/ride';

export default function RideTrackingScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // 2. WebSocket para actualizaciones instantáneas (opcional)
  // Si querés, podés sumar esto después usando el socketURL del backend

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />;
  if (!ride) return <Text style={{ textAlign: 'center', marginTop: 60 }}>No se encontró el viaje.</Text>;

  // Mapear la info para el mapa y la UI:
  const { origin, destination, driver, vehicle, taxiPosition, status } = ride;

  return (
    <View style={styles.container}>
      <TaxiMap
        origin={origin}
        destination={destination}
        taxiPosition={taxiPosition}
      />
      <View style={styles.infoBox}>
        <DriverInfoCard driver={driver} vehicle={vehicle} />
        <Text style={styles.estado}>
          {status === 'requested' && t('taxi_on_the_way')}
          {status === 'accepted' && t('taxi_on_the_way')}
          {status === 'in_progress' && t('trip_in_progress')}
          {status === 'completed' && t('trip_arrived_title')}
          {status === 'cancelled' && t('trip_cancelled_title')}
        </Text>
      </View>
      {/* Aquí van los botones SOS, Compartir, Cancelar, etc. */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          Alert.alert(
            t('cancel_trip_btn'),
            t('cancel_warning_dialog', { fine: 500 }),
            [
              { text: t('no'), style: 'cancel' },
              {
                text: t('yes_cancel'),
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
        <Text style={styles.cancelBtnText}>{t('cancel_trip_btn')}</Text>
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
