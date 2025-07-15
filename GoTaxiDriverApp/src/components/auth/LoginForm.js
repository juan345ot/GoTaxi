import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { isEmail, minLength } from '../../utils/validators';

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    let errs = {};
    if (!isEmail(email)) errs.email = 'Email inválido';
    if (!minLength(password, 6)) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = () => {
    if (validate()) onSubmit({ email, password });
  };

  return (
    <View>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: errors.email ? 'red' : '#ccc', borderRadius: 8, padding: 8 }} />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
      <Text style={{ marginTop: 8 }}>Contraseña</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry
        style={{ borderWidth: 1, borderColor: errors.password ? 'red' : '#ccc', borderRadius: 8, padding: 8 }} />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}
      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#007aff', marginTop: 16, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
    </View>
  );
}
