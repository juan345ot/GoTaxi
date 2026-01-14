import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/common/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';
import i18n from '../../translations';

export default function TripSummaryScreen({ route, navigation }) {
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
  
  const {
    origin = 'Origen desconocido',
    destination = 'Destino desconocido',
    distance = 0,
    duration = 0,
    total = 0,
    cancelado = false,
    multa = 0,
    paymentMethod = 'cash',
    rideId,
  } = route.params || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
      <View style={styles.content}>
      <Text style={styles.title}>{cancelado ? i18n.t('trip_cancelled_title') : i18n.t('trip_arrived_title')}</Text>
      <View style={styles.section}>
        <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>{i18n.t('from')}: <Text style={[styles.value, { color: safeTheme.colors.text }]}>{origin}</Text></Text>
        <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>{i18n.t('to')}: <Text style={[styles.value, { color: safeTheme.colors.text }]}>{destination}</Text></Text>
        <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>{i18n.t('distance')}: <Text style={[styles.value, { color: safeTheme.colors.text }]}>{distance} m</Text></Text>
        <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>{i18n.t('duration')}: <Text style={[styles.value, { color: safeTheme.colors.text }]}>{duration} min</Text></Text>
        <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>{i18n.t('total_amount')}: <Text style={[cancelado ? styles.importeMulta : styles.importe, { color: cancelado ? '#e53935' : safeTheme.colors.text }]}>
          ${cancelado ? multa : total}
        </Text></Text>
        {cancelado ? (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={20} color="#e53935" style={{ marginRight: 7 }} />
            <Text style={styles.multaDetalle}>
              {typeof i18n.t('cancel_warning') === 'function' 
                ? i18n.t('cancel_warning')(multa || 500)
                : `Se aplicó una multa de $${multa || 500} por cancelación tardía.`}
            </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 23, fontWeight: 'bold', color: '#007aff', textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 18 },
  label: { fontWeight: '700', fontSize: 15, marginTop: 7 },
  value: { fontSize: 17 },
  importe: { fontSize: 28, fontWeight: 'bold', marginTop: 3 },
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
