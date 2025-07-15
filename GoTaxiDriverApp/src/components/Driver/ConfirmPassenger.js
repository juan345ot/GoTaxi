import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function ConfirmPassenger({ onConfirm }) {
  return (
    <TouchableOpacity
      onPress={onConfirm}
      style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginVertical: 14, width: '90%', alignSelf: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Confirmar que el pasajero subió</Text>
    </TouchableOpacity>
  );
}
