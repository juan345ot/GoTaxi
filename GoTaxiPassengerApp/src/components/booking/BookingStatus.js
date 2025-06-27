import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const statusMap = {
  buscando: {
    label: 'Buscando conductor...',
    icon: 'search',
    color: colors.info,
  },
  camino: {
    label: 'Conductor en camino',
    icon: 'car',
    color: colors.primary,
  },
  finalizado: {
    label: 'Viaje finalizado',
    icon: 'checkmark-circle',
    color: colors.success,
  },
};

export default function BookingStatus({ status }) {
  const { label, icon, color } = statusMap[status] || statusMap.buscando;

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
