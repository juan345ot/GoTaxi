import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import RatingStars from '../../components/common/RatingStars';
import { Ionicons } from '@expo/vector-icons';

export default function RateRideScreen({ route, navigation }) {
  // Recibimos todos los datos del viaje y pago por params
  const {
    driver = 'Carlos Pérez',
    vehicle = 'Toyota Etios Blanco',
    importe = 0,
    metodoPago = '',
    pin = '',
    origin = '',
    destination = '',
    distancia = 0,
    duration = 0,
    // ...otros datos si querés
  } = route.params || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleFinish = () => {
    // Guardá en historial (simulado; después hacelo persistente o global)
    // Podés armar una función saveTrip({ ...datos }) y llamarla aquí
    // O usar context/global si querés que sea pro
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>¿Cómo fue tu viaje?</Text>
      <View style={styles.section}>
        <Text style={styles.driver}>Conductor: <Text style={styles.bold}>{driver}</Text></Text>
        <Text style={styles.vehicle}>Vehículo: {vehicle}</Text>
        <Text style={styles.importe}>Importe pagado: <Text style={{ color: '#007aff', fontWeight: 'bold' }}>${importe}</Text></Text>
        <Text style={styles.label}>Método de pago: {metodoPago === 'cash'
          ? 'Efectivo'
          : metodoPago === 'mp'
            ? 'Mercado Pago'
            : 'Tarjeta'}</Text>
        <Text style={styles.label}>PIN: {pin}</Text>
      </View>
      <Text style={styles.label}>Calificá tu viaje:</Text>
      <RatingStars value={rating} onChange={setRating} size={34} />
      <TextInput
        placeholder="Dejá tu comentario (opcional)"
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        maxLength={200}
        multiline
      />

      <TouchableOpacity style={styles.btnProblema} onPress={() => navigation.navigate('Support')}>
        <Ionicons name="alert-circle-outline" size={20} color="#e53935" />
        <Text style={styles.btnProblemaText}>Tuve un problema</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleFinish}>
        <Text style={styles.confirmBtnText}>Finalizar y volver al inicio</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007aff', textAlign: 'center', marginBottom: 13 },
  section: { marginBottom: 14 },
  driver: { fontSize: 17, color: '#444', marginBottom: 2 },
  bold: { fontWeight: 'bold', color: '#007aff' },
  vehicle: { color: '#555', fontSize: 15, marginBottom: 1 },
  importe: { fontWeight: '600', fontSize: 16, color: '#333', marginTop: 5 },
  label: { marginTop: 10, fontSize: 15, color: '#444', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 7,
    paddingHorizontal: 12, paddingVertical: 8, minHeight: 44, marginVertical: 14,
    color: '#222', fontSize: 16,
  },
  btnProblema: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fdecea', borderRadius: 8, padding: 13, justifyContent: 'center', marginBottom: 17,
  },
  btnProblemaText: { color: '#e53935', fontWeight: '600', marginLeft: 5 },
  confirmBtn: {
    backgroundColor: '#007aff', padding: 14, borderRadius: 8, alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
