import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import useAuth from '../../hooks/useAuth';
import { validateRegister } from '../../utils/validators';
import { showToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
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

  const handleGoogleRegister = () => {
    showToast('Registro con Google (simulado)');
    // Lógica real de Google a futuro
  };

  return (
    <View style={styles.wrapper}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />

      <View style={styles.card}>
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

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleRegister}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Registrarme con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkBtnText}>
            ¿Ya tenés cuenta? <Text style={styles.linkBold}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 7,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e94235',
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  googleBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkBtnText: {
    color: '#333',
    fontSize: 15,
  },
  linkBold: {
    color: '#007aff',
    fontWeight: 'bold',
  },
});
