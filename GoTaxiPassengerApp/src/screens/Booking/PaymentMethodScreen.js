import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/common/AppHeader';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function PaymentMethodScreen({ route, navigation }) {
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
  
  const { rideId, total, paymentMethod: initialMethod } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState(initialMethod || 'cash');
  const [loading, setLoading] = useState(false);

  // Debug info
  // Debug info - removed for production

  const handleConfirmPayment = async() => {
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
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
      <View style={styles.content}>
        <Text style={[styles.label, { color: safeTheme.colors.text }]}>Total a pagar: ${total}</Text>
      <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      <PrimaryButton title="Confirmar pago" onPress={handleConfirmPayment} loading={loading} icon="cash" />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 22, textAlign: 'center' },
});
