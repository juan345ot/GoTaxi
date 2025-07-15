import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import UploadField from '../../components/common/UploadField';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados para los uploads
  const [auto, setAuto] = useState(null);
  const [carnet, setCarnet] = useState(null);
  const [seguro, setSeguro] = useState(null);
  const [vtv, setVtv] = useState(null);
  const [multas, setMultas] = useState(null);
  const [antecedentes, setAntecedentes] = useState(null);

  const handleRegister = () => {
    if (!name || !email || !password || !auto || !carnet || !seguro || !vtv || !multas || !antecedentes) {
      Alert.alert('Completa todos los campos y documentos');
      return;
    }
    // Aquí irá la lógica de registro con backend
    Alert.alert('Registro exitoso', '¡Ahora espera la validación de tus documentos!');
    // navigation.replace('Login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <AuthHeader eslogan="Subí tus documentos y activá tu cuenta de conductor" />
        <View style={{ width: '85%' }}>
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
          {/* Campos de Upload */}
          <UploadField label="Foto del auto" value={auto} onChange={setAuto} />
          <UploadField label="Carnet de conducir" value={carnet} onChange={setCarnet} />
          <UploadField label="Seguro" value={seguro} onChange={setSeguro} />
          <UploadField label="VTV" value={vtv} onChange={setVtv} />
          <UploadField label="Libre de multas" value={multas} onChange={setMultas} />
          <UploadField label="Certificado de antecedentes" value={antecedentes} onChange={setAntecedentes} />

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
