import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import PrimaryButton from '../../components/common/PrimaryButton';
import InputField from '../../components/common/InputField';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import { LocationContext } from '../../contexts/LocationContext';
import { showToast } from '../../utils/toast';
import useMap from '../../hooks/useMap';

export default function RideRequestScreen({ navigation }) {
  const { location } = useMap();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    showToast('¡Viaje solicitado!');
    navigation.navigate('RideTracking', { origin, destination });
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

      <PrimaryButton title="Solicitar Viaje" onPress={handleRequestRide} icon="car" />

      <BookingConfirmationModal
        visible={showModal}
        origin={origin}
        destination={destination}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
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
