import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../translations';

export default function TripSummaryScreen({ route, navigation }) {
  const {
    origin = "Origen desconocido",
    destination = "Destino desconocido",
    distance = 0,
    duration = 0,
    total = 0,
    driver,
    vehicle,
    cancelado = false,
    multa = 0,
    paymentMethod = 'cash',
    rideId
  } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cancelado ? i18n.t('trip_cancelled_title') : i18n.t('trip_arrived_title')}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>{i18n.t('from')}: <Text style={styles.value}>{origin}</Text></Text>
        <Text style={styles.label}>{i18n.t('to')}: <Text style={styles.value}>{destination}</Text></Text>
        <Text style={styles.label}>{i18n.t('distance')}: <Text style={styles.value}>{distance} m</Text></Text>
        <Text style={styles.label}>{i18n.t('duration')}: <Text style={styles.value}>{duration} min</Text></Text>
        <Text style={styles.label}>{i18n.t('total_amount')}: <Text style={cancelado ? styles.importeMulta : styles.importe}>
          ${cancelado ? multa : total}
        </Text></Text>
        {cancelado ? (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={20} color="#e53935" style={{ marginRight: 7 }} />
            <Text style={styles.multaDetalle}>{i18n.t('cancel_warning', { fine: multa })}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.btnPago}
          onPress={() => navigation.navigate('PaymentMethod', { total, paymentMethod, rideId })}
        >
          <Ionicons name="cash-outline" size={21} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.btnPagoText}>{i18n.t('pay_methods_btn')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.btnProblema}
          onPress={() => navigation.navigate('Support')}
        >
          <Ionicons name="alert-circle-outline" size={20} color="#e53935" />
          <Text style={styles.btnProblemaText}>{i18n.t('problem_btn')}</Text>
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
  btnPago: {
    backgroundColor: '#007aff', padding: 15, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  btnPagoText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  btnProblema: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fdecea', borderRadius: 8, padding: 13, justifyContent: 'center', marginBottom: 17,
  },
  btnProblemaText: { color: '#e53935', fontWeight: '600', marginLeft: 5, fontSize: 16 },
});
