import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // TODO: Integrar registro real y uploads con backend
    // navigation.replace('Driver');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 40 }}>
        <AuthHeader eslogan="Registrate, subí docs y empezá a ganar con GoTaxi" />
        <View style={{ width: '80%' }}>
          <Text style={{ marginVertical: 8 }}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, borderRadius: 6, padding: 8 }}
            placeholder="Nombre completo"
          />
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
          {/* Aquí van los campos de uploads (pendiente de siguiente módulo) */}
          <TouchableOpacity
            onPress={handleRegister}
            style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 6, marginTop: 16 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Registrarse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 16 }}>
            <Text style={{ color: '#2563eb', textAlign: 'center' }}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
