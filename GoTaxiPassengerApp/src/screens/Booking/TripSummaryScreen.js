import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { calcularImporte, generarPin, BASE_FARE, FARE_PER_100M } from '../../utils/tripUtils';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../translations'; // Usamos tu helper

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
      <Text style={styles.title}>{cancelado ? t('trip_cancelled_title') : t('trip_arrived_title')}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('from')}:</Text>
        <Text style={styles.value}>{origin}</Text>
        <Text style={styles.label}>{t('to')}:</Text>
        <Text style={styles.value}>{destination}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('distance')}:</Text>
        <Text style={styles.value}>{distancia} metros</Text>
        <Text style={styles.label}>{t('duration')}:</Text>
        <Text style={styles.value}>{duration} min</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('total_amount')}:</Text>
        <Text style={cancelado ? styles.importeMulta : styles.importe}>
          ${importe}
        </Text>
        {!cancelado ? (
          <Text style={styles.tarifaDetalle}>
            {t('base_fare_formula', { base: BASE_FARE, per100m: FARE_PER_100M })}
          </Text>
        ) : (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={20} color="#e53935" style={{ marginRight: 7 }} />
            <Text style={styles.multaDetalle}>
              {t('cancel_warning', { fine: multa })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('payment_pin')}:</Text>
        <Text style={styles.pin}>{pin}</Text>
        <Text style={styles.pinDesc}>
          {t('pin_desc')}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnProblema}
          onPress={() => navigation.navigate('Support')}
          accessibilityLabel={t('problem_btn')}
        >
          <Ionicons name="alert-circle-outline" size={20} color="#e53935" />
          <Text style={styles.btnProblemaText}>{t('problem_btn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPago}
          onPress={() => navigation.navigate('PaymentMethod', { importe, pin, origin, destination, driver, vehicle, cancelado, multa })}
          accessibilityLabel={t('pay_methods_btn')}
        >
          <Ionicons name="cash-outline" size={21} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.btnPagoText}>{t('pay_methods_btn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 23, fontWeight: 'bold', color: '#007aff', textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 18 },
  label: { fontWeight: '700', color: '#444', fontSize: 15, marginTop: 7 },
  value: { color: '#222', fontSize: 17 },
  importe: { fontSize: 28, color: '#222', fontWeight: 'bold', marginTop: 3 },
  importeMulta: { fontSize: 28, color: '#e53935', fontWeight: 'bold', marginTop: 3 },
  tarifaDetalle: { color: '#666', fontSize: 13, marginTop: 1 },
  multaDetalle: { color: '#e53935', fontSize: 13, marginTop: 2, fontWeight: '600' },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    marginBottom: 2,
  },
  pin: { fontSize: 30, color: '#007aff', fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
  pinDesc: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 2 },
  actions: { marginTop: 28 },
  btnProblema: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fdecea', borderRadius: 8, padding: 13, justifyContent: 'center', marginBottom: 17,
  },
  btnProblemaText: { color: '#e53935', fontWeight: '600', marginLeft: 5, fontSize: 16 },
  btnPago: {
    backgroundColor: '#007aff', padding: 15, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  btnPagoText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
