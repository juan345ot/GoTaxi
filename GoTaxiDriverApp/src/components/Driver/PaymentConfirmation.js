import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function PaymentConfirmation({ onConfirm }) {
  const [pin, setPin] = useState('');

  return (
    <View style={{ alignItems: 'center', padding: 18 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Ingresá el PIN mostrado por el pasajero:</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        placeholder="PIN"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 6, padding: 8, width: 100, textAlign: 'center', marginBottom: 12 }}
      />
      <TouchableOpacity
        onPress={() => onConfirm(pin)}
        style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8, width: 100 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}
