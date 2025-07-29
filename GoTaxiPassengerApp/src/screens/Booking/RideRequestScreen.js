import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PrimaryButton from '../../components/common/PrimaryButton';
import InputField from '../../components/common/InputField';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import { showToast } from '../../utils/toast';
import useMap from '../../hooks/useMap';
import useRide from '../../hooks/useRide'; // 🚀 Nuevo hook real

export default function RideRequestScreen({ navigation }) {
  const { location } = useMap();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showModal, setShowModal] = useState(false);

  const { requestRide, loading, rideData } = useRide();

  const handleConfirm = async () => {
    setShowModal(false);
    try {
      await requestRide(origin, destination, paymentMethod);
      if (rideData) {
        navigation.navigate('RideTracking', {
          rideId: rideData._id,
          ...rideData
        });
      }
    } catch (e) {
      showToast('No se pudo solicitar el viaje');
    }
  };

  const handleRequestRide = () => {
    if (!origin || !destination) {
      showToast('Por favor completá origen y destino');
      return;
    }
    setShowModal(true);
  };

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

      <PrimaryButton title="Solicitar Viaje" onPress={handleRequestRide} icon="car" loading={loading} />

      <BookingConfirmationModal
        visible={showModal}
        origin={origin}
        destination={destination}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        customConfirmText={`Confirmar (${paymentMethod})`}
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
