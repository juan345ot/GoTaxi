import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import Loader from '../../components/common/Loader';
import { isValidEmail, isValidPassword } from '../../utils/validators';

export default function RegisterScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!isValidEmail(email)) {
      setError('Correo inválido');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Contraseña muy corta');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    login(email, password); // registro simulado seguido de login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
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
      <InputField
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {loading && <Loader />}
      <PrimaryButton title="Registrarse" onPress={handleRegister} />
      <PrimaryButton title="Volver" onPress={() => navigation.goBack()} />
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

