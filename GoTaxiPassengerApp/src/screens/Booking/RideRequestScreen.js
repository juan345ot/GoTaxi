import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/common/AppHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import InputField from '../../components/common/InputField';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import useMap from '../../hooks/useMap';
import useRide from '../../hooks/useRide'; // 🚀 Nuevo hook real

export default function RideRequestScreen({ navigation }) {
  // Obtener tema con validación robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }
  
  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };
  
  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }
  
  // Garantizar que colors siempre exista
  if (!theme || !theme.colors) {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  
  // Validación final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showModal, setShowModal] = useState(false);

  const { requestRide, loading } = useRide();

  const handleConfirm = async() => {
    setShowModal(false);
    try {
      const newRide = await requestRide(origin, destination, paymentMethod);
      // Navegar a selección de conductor con el viaje creado
      const rideId = newRide._id || newRide.id;
      if (!rideId) {
        showToast('Error: No se pudo obtener el ID del viaje');
        return;
      }
      navigation.navigate('DriverSelection', {
        rideId,
        origin: {
          address: origin,
          latitude: newRide.origen?.lat || 0,
          longitude: newRide.origen?.lng || 0,
        },
        destination: {
          address: destination,
          latitude: newRide.destino?.lat || 0,
          longitude: newRide.destino?.lng || 0,
        },
      });
    } catch (e) {
      // Error al solicitar viaje - handled by error handler
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
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
      <View style={styles.content}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
