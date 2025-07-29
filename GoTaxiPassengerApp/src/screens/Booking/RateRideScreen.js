import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RatingStars from '../../components/common/RatingStars';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function RateRideScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
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
    <View style={styles.container}>
      <Text style={styles.title}>Calificá tu experiencia</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 22, textAlign: 'center' },
});
