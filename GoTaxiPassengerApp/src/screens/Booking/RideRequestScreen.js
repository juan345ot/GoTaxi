import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PrimaryButton from '../../components/common/PrimaryButton';
import InputField from '../../components/common/InputField';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import { LocationContext } from '../../contexts/LocationContext';
import { showToast } from '../../utils/toast';
import useMap from '../../hooks/useMap';

export default function RideRequestScreen({ navigation }) {
  const { location } = useMap();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    showToast(`Viaje solicitado. Método: ${getPaymentLabel(paymentMethod)}`);
    navigation.navigate('RideTracking', { origin, destination, paymentMethod });
  };

  const handleRequestRide = () => {
    if (!origin || !destination) {
      showToast('Por favor completá origen y destino');
      return;
    }
    setShowModal(true);
  };

  function getPaymentLabel(method) {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'mp': return 'Mercado Pago';
      default: return 'Desconocido';
    }
  }

  return (
    <View style={styles.container}>
      <InputField
        label="Origen"
        value={origin}
        onChangeText={setOrigin}
        placeholder="Ingresá tu ubicación actual"
        icon="location"
      />
      <InputField
        label="Destino"
        value={destination}
        onChangeText={setDestination}
        placeholder="¿A dónde querés ir?"
        icon="flag"
      />

      <PaymentMethodSelector
        selected={paymentMethod}
        onSelect={setPaymentMethod}
      />

      <PrimaryButton title="Solicitar Viaje" onPress={handleRequestRide} icon="car" />

      <BookingConfirmationModal
        visible={showModal}
        origin={origin}
        destination={destination}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        customConfirmText={`Confirmar (${getPaymentLabel(paymentMethod)})`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
