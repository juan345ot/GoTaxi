import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';
import AuthHeader from '../../components/auth/AuthHeader';
import useAuth from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validators';
import { showToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const error = validateLogin({ email, password });
    if (error) return showToast(error);
    login(email, password);
  };

  const handleGoogleLogin = () => {
    showToast('Login con Google (simulado)');
    // Aquí va la lógica real de Google en el futuro
  };

  return (
    <View style={styles.wrapper}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />

      <View style={styles.card}>
        <AuthForm
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={handleLogin}
          buttonText="Iniciar sesión"
          loading={loading}
        />

        <TouchableOpacity style={styles.forgot} onPress={() => showToast('Funcionalidad próximamente')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Ingresar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkBtnText}>
            ¿No tenés cuenta? <Text style={styles.linkBold}>Registrate</Text>
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
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 18,
  },
  forgotText: {
    color: '#007aff',
    fontWeight: '600',
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e94235',
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 14,
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
