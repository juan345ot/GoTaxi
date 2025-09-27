import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';

const LoginScreen = memo(function LoginScreen() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
    }
  }, [isAuthenticated]);

  const handleLogin = useCallback(async () => {
    if (!email?.trim()) {
      showToast('El correo electrónico es obligatorio');
      return;
    }
    if (!password?.trim()) {
      showToast('La contraseña es obligatoria');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('El formato del correo electrónico no es válido');
      return;
    }
    
    await login(email.trim(), password);
  }, [email, password, login]);

  const handleGoogleLogin = useCallback(() => {
    showToast('Login con Google (próximamente)');
  }, []);

  const handleForgotPassword = useCallback(() => {
    showToast('Funcionalidad próximamente');
  }, []);

  const handleNavigateToRegister = useCallback(() => {
    navigation.navigate(ROUTES.REGISTER);
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <View style={styles.card}>
        <InputField 
          label="Correo Electrónico" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          placeholder="ejemplo@correo.com"
          icon="mail" 
        />
        <InputField 
          label="Contraseña" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          placeholder="Ingresa tu contraseña"
          icon="lock-closed" 
        />
        <TouchableOpacity style={styles.forgot} onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <PrimaryButton title="Iniciar sesión" loading={loading} onPress={handleLogin} icon="log-in" />
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Ingresar con Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={handleNavigateToRegister} disabled={loading}>
          <Text style={styles.linkBtnText}>¿No tenés cuenta? <Text style={styles.linkBold}>Registrate</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    justifyContent: 'center',
    padding: 20,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  forgot: { 
    alignSelf: 'flex-end', 
    marginTop: 8, 
    marginBottom: 16 
  },
  forgotText: { 
    color: '#007AFF', 
    fontWeight: '600',
    fontSize: 14,
  },
  googleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#DB4437', 
    padding: 16, 
    borderRadius: 12, 
    justifyContent: 'center', 
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleBtnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
  linkBtn: { 
    alignItems: 'center', 
    marginTop: 20 
  },
  linkBtnText: { 
    color: '#6B7280',
    fontSize: 16,
  },
  linkBold: { 
    color: '#007AFF', 
    fontWeight: '700' 
  },
});

export default LoginScreen;
