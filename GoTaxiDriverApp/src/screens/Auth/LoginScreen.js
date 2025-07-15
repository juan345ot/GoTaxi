import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Integrar login real con backend
    // navigation.replace('Driver'); // Simula login exitoso
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
        <AuthHeader eslogan="¡Conduce con GoTaxi y ganá más viajes!" />
        <View style={{ width: '80%' }}>
          <Text style={{ marginVertical: 8 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderRadius: 6, padding: 8 }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ejemplo@mail.com"
          />
          <Text style={{ marginVertical: 8 }}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, borderRadius: 6, padding: 8 }}
            placeholder="********"
          />
          <TouchableOpacity
            onPress={handleLogin}
            style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 6, marginTop: 16 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 16 }}>
            <Text style={{ color: '#2563eb', textAlign: 'center' }}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
