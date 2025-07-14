import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { calcularImporte, generarPin, BASE_FARE, FARE_PER_100M } from '../../utils/tripUtils';
import { Ionicons } from '@expo/vector-icons';

export default function TripSummaryScreen({ route, navigation }) {
  const {
    origin = "Ejemplo 1",
    destination = "Ejemplo 2",
    distancia = 3200,
    duration = 14,
    driver = "Carlos Pérez",
    vehicle = "Toyota Etios Blanco",
    multa = 0,
    cancelado = false,
  } = route.params || {};

  const importe = cancelado ? multa : calcularImporte(distancia);
  const pin = generarPin();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cancelado ? 'Viaje cancelado' : '¡Llegaste a tu destino!'}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Desde:</Text>
        <Text style={styles.value}>{origin}</Text>
        <Text style={styles.label}>Hasta:</Text>
        <Text style={styles.value}>{destination}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Distancia recorrida:</Text>
        <Text style={styles.value}>{distancia} metros</Text>
        <Text style={styles.label}>Duración:</Text>
        <Text style={styles.value}>{duration} min</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Importe total:</Text>
        <Text style={cancelado ? styles.importeMulta : styles.importe}>
          ${importe}
        </Text>
        {!cancelado ? (
          <Text style={styles.tarifaDetalle}>
            Tarifa base: ${BASE_FARE} + ${FARE_PER_100M} cada 100m
          </Text>
        ) : (
          <Text style={styles.multaDetalle}>
            Se aplicó una <Text style={{ fontWeight: 'bold' }}>multa de ${multa}</Text> por cancelar el viaje.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>PIN de pago:</Text>
        <Text style={styles.pin}>{pin}</Text>
        <Text style={styles.pinDesc}>
          Decile este PIN al conductor si pagás en efectivo.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnProblema} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="alert-circle-outline" size={20} color="#e53935" />
          <Text style={styles.btnProblemaText}>Tuve un problema</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPago}
          onPress={() => navigation.navigate('PaymentMethod', { importe, pin, origin, destination, driver, vehicle, cancelado, multa })}
        >
          <Ionicons name="cash-outline" size={21} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.btnPagoText}>Ir a métodos de pago</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 23, fontWeight: 'bold', color: '#007aff', textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 18 },
  label: { fontWeight: '700', color: '#444', fontSize: 14, marginTop: 7 },
  value: { color: '#222', fontSize: 16 },
  importe: { fontSize: 28, color: '#222', fontWeight: 'bold', marginTop: 3 },
  importeMulta: { fontSize: 28, color: '#e53935', fontWeight: 'bold', marginTop: 3 },
  tarifaDetalle: { color: '#666', fontSize: 12, marginTop: 1 },
  multaDetalle: { color: '#e53935', fontSize: 13, marginTop: 2, fontWeight: '600' },
  pin: { fontSize: 30, color: '#007aff', fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
  pinDesc: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 2 },
  actions: { marginTop: 28 },
  btnProblema: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fdecea', borderRadius: 8, padding: 13, justifyContent: 'center', marginBottom: 17,
  },
  btnProblemaText: { color: '#e53935', fontWeight: '600', marginLeft: 5 },
  btnPago: {
    backgroundColor: '#007aff', padding: 15, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  btnPagoText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
