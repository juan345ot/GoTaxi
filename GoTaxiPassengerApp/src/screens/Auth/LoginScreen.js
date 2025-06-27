import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import Loader from '../../components/common/Loader';
import { isValidEmail, isValidPassword } from '../../utils/validators';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      setError('Correo inválido');
      return;
    }
    if (!isValidPassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError('');
    login(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <InputField
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <InputField
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading && <Loader />}
      <PrimaryButton title="Entrar" onPress={handleLogin} />
      <PrimaryButton
        title="Registrarse"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

