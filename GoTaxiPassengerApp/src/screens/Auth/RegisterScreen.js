import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../hooks/useAuth';
import { validateRegister } from '../../utils/validators';
import { showToast } from '../../utils/toast';

export default function RegisterScreen() {
  const { register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) return showToast('Las contraseñas no coinciden');

    const error = validateRegister({ name, email, password });
    if (error) return showToast(error);

    register(email, password);
  };

  return (
    <View style={styles.container}>
      <AuthForm
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        name={name}
        showName
        showConfirm
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onChangeConfirmPassword={setConfirmPassword}
        onChangeName={setName}
        onSubmit={handleRegister}
        buttonText="Registrarme"
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
