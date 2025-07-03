import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RatingStars from '../../components/common/RatingStars';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';

export default function RateRideScreen({ route, navigation }) {
  const [rating, setRating] = useState(0);
  const { driver = 'Juan M.', vehicle = 'Toyota Etios Blanco' } = route.params || {};

  const handleSubmit = () => {
    if (!rating) return showToast('Por favor, seleccioná una calificación');
    showToast('¡Gracias por calificar tu viaje!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo fue tu viaje?</Text>
      <Text style={styles.driver}>{driver} ({vehicle})</Text>
      <RatingStars value={rating} onChange={setRating} />
      <PrimaryButton
        title="Enviar Calificación"
        icon="star"
        onPress={handleSubmit}
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  driver: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
});
