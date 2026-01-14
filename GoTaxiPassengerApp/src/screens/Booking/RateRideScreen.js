import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/common/AppHeader';
import RatingStars from '../../components/common/RatingStars';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function RateRideScreen({ route, navigation }) {
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
  
  const { rideId } = route.params || {};
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async() => {
    setLoading(true);
    try {
      await rideApi.rateRide(rideId, rating, comment);
      showToast('¡Gracias por calificar!');
      navigation.replace('Home');
    } catch (e) {
      showToast('No se pudo registrar tu calificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: safeTheme.colors.text }]}>Calificá tu experiencia</Text>
      <RatingStars value={rating} onChange={setRating} editable />
      <InputField
        label="Comentario (opcional)"
        value={comment}
        onChangeText={setComment}
        placeholder="Contanos cómo fue tu viaje"
        multiline
      />
      <PrimaryButton title="Enviar calificación" onPress={handleFinish} loading={loading} icon="star" />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 22, textAlign: 'center' },
});
