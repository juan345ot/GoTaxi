import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const METHODS = [
  {
    key: 'cash',
    label: 'Efectivo',
    icon: <Ionicons name="cash-outline" size={28} color="#007aff" />,
    color: '#f8fdff',
  },
  {
    key: 'card',
    label: 'Tarjeta de Débito/Crédito',
    icon: <FontAwesome5 name="credit-card" size={22} color="#007aff" />,
    color: '#faf7ff',
  },
  {
    key: 'mp',
    label: 'Mercado Pago',
    icon: <MaterialCommunityIcons name="credit-card-multiple-outline" size={26} color="#007aff" />,
    color: '#fffef7',
  },
];

export default function PaymentMethodScreen({ route, navigation }) {
  const { importe, pin, ...tripData } = route.params || {};
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [efectivoConfirmado, setEfectivoConfirmado] = useState(false);
  const [conductorConfirmado, setConductorConfirmado] = useState(false); // simulado

  // Simular confirmación del conductor (en el futuro será por backend)
  const simulateConductorConfirm = () => {
    setTimeout(() => setConductorConfirmado(true), 2500); // simula espera
  };

  const handleConfirmar = () => {
    if (!selected) {
      Alert.alert('Elegí un método de pago');
      return;
    }
    if (selected === 'cash') {
      setConfirming(true);
      setTimeout(() => {
        setEfectivoConfirmado(true);
        simulateConductorConfirm();
      }, 1400);
    } else {
      // Simular pago con tarjeta o MP, luego ir a rating
      navigation.replace('RateRide', {
        ...tripData,
        importe,
        metodoPago: selected,
        pin,
        estadoPago: 'confirmado',
      });
    }
  };

  // Cuando ambos confirman, pasar a rating
  if (efectivoConfirmado && conductorConfirmado) {
    setTimeout(() => {
      navigation.replace('RateRide', {
        ...tripData,
        importe,
        metodoPago: selected,
        pin,
        estadoPago: 'confirmado',
      });
    }, 1000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegí cómo vas a pagar</Text>
      <Text style={styles.importe}>Importe a pagar: <Text style={{ color: '#007aff', fontWeight: 'bold' }}>${importe}</Text></Text>

      <View style={styles.methods}>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodBtn, selected === m.key && styles.methodBtnActive, { backgroundColor: m.color }]}
            onPress={() => setSelected(m.key)}
            disabled={confirming}
          >
            {m.icon}
            <Text style={styles.methodLabel}>{m.label}</Text>
            {selected === m.key && <Ionicons name="checkmark-circle" size={23} color="#007aff" style={{ marginLeft: 7 }} />}
          </TouchableOpacity>
        ))}
      </View>

      {selected === 'cash' && (
        <View style={styles.pinBox}>
          <Text style={styles.pinLabel}>PIN de pago:</Text>
          <Text style={styles.pin}>{pin}</Text>
          <Text style={styles.pinDesc}>
            Decile este PIN al conductor. Esperá que confirme el cobro.
          </Text>
          <Text style={{ textAlign: 'center', color: '#007aff', marginTop: 10 }}>
            {efectivoConfirmado
              ? conductorConfirmado
                ? '¡Conductor confirmó el pago en efectivo!'
                : 'Esperando confirmación del conductor...'
              : 'Esperando tu confirmación de pago...'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmar} disabled={confirming || conductorConfirmado}>
        {confirming && !conductorConfirmado ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmBtnText}>
            {selected === 'cash'
              ? efectivoConfirmado
                ? conductorConfirmado
                  ? 'Pago confirmado'
                  : 'Esperando al conductor...'
                : 'Confirmar que pagué'
              : 'Pagar'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 22, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007aff', textAlign: 'center', marginBottom: 9 },
  importe: { fontSize: 17, color: '#222', marginBottom: 18, textAlign: 'center' },
  methods: { marginBottom: 16 },
  methodBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, padding: 13, marginBottom: 10,
    borderColor: '#ddd', borderWidth: 1,
  },
  methodBtnActive: { borderColor: '#007aff', backgroundColor: '#e6f2ff' },
  methodLabel: { flex: 1, marginLeft: 12, fontWeight: '600', fontSize: 15, color: '#222' },
  pinBox: {
    backgroundColor: '#f7faff', borderRadius: 10, padding: 13,
    marginBottom: 15, marginTop: 2, alignItems: 'center',
  },
  pinLabel: { color: '#444', fontWeight: '700', fontSize: 13 },
  pin: { color: '#007aff', fontWeight: 'bold', fontSize: 30, letterSpacing: 2 },
  pinDesc: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 2 },
  confirmBtn: {
    backgroundColor: '#007aff', padding: 15, borderRadius: 9,
    marginTop: 14, alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
