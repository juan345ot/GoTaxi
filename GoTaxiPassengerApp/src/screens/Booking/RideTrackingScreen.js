import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import BookingStatus from '../../components/booking/BookingStatus';
import MapPreview from '../../components/map/MapPreview';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';

export default function RideTrackingScreen({ route, navigation }) {
  const { origin, destination, paymentMethod, driver = 'Juan M.', vehicle = 'Toyota Etios Blanco' } = route.params || {};
  const [status, setStatus] = useState('camino');

  const region = {
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

  const handleCancel = () => {
    setStatus('cancelado');
    showToast('Viaje cancelado');
    // Si querés, podrías volver a Home después de unos segundos:
    setTimeout(() => navigation.navigate('Home'), 1500);
  };

  return (
    <View style={styles.container}>
      <BookingStatus status={status} />
      <MapPreview region={region} markers={markers} />
      <Text style={styles.info}>Conductor: {driver} - {vehicle}</Text>
      <Text style={styles.info}>
        Pago: {paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Mercado Pago'}
      </Text>
      {status !== 'cancelado' && (
        <PrimaryButton
          title="Cancelar Viaje"
          icon="close-circle"
          variant="danger"
          onPress={handleCancel}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  info: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 16,
  },
});
