import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { isEmail } from '../../utils/validators';

export default function RecoveryForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleRecovery = () => {
    if (!isEmail(email)) {
      setError('Email inválido');
      return;
    }
    setError(null);
    onSubmit(email);
  };

  return (
    <View>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 8, padding: 8 }} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <TouchableOpacity onPress={handleRecovery} style={{ backgroundColor: '#007aff', marginTop: 16, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{loading ? 'Cargando...' : 'Enviar enlace'}</Text>
      </TouchableOpacity>
    </View>
  );
}
