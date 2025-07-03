import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validators';
import { showToast } from '../../utils/toast';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const error = validateLogin({ email, password });
    if (error) return showToast(error);
    login(email, password);
  };

  return (
    <View style={styles.container}>
      <AuthForm
        email={email}
        password={password}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onSubmit={handleLogin}
        buttonText="Iniciar sesión"
        loading={loading}
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
});
