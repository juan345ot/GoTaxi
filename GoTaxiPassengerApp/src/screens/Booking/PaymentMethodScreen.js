import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function PaymentMethodScreen({ route, navigation }) {
  const { rideId, total, paymentMethod: initialMethod } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState(initialMethod || 'cash');
  const [loading, setLoading] = useState(false);

  // Debug info
  console.log('PaymentMethodScreen - rideId:', rideId);
  console.log('PaymentMethodScreen - route.params:', route.params);

  const handleConfirmPayment = async () => {
    if (!rideId) {
      showToast('Error: ID del viaje no encontrado');
      return;
    }
    
    setLoading(true);
    try {
      await rideApi.payForRide(rideId, paymentMethod);
      showToast('Pago confirmado');
      navigation.replace('RateRide', { rideId }); // Navega a calificar el viaje
    } catch (e) {
      showToast('No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total a pagar: ${total}</Text>
      <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      <PrimaryButton title="Confirmar pago" onPress={handleConfirmPayment} loading={loading} icon="cash" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 22, textAlign: 'center' },
});
