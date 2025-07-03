import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const METHODS = [
  { id: 'cash', label: 'Efectivo', icon: 'cash' },
  { id: 'card', label: 'Tarjeta', icon: 'card' },
  { id: 'mp', label: 'Mercado Pago', icon: 'logo-usd' },
];

export default function PaymentMethodSelector({ selected, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.options}>
        {METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.option,
              selected === method.id && styles.optionSelected,
            ]}
            onPress={() => onSelect(method.id)}
          >
            <Ionicons
              name={method.icon}
              size={20}
              color={selected === method.id ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.optionText,
                selected === method.id && styles.textSelected,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.text,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  optionText: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
  },
  textSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
