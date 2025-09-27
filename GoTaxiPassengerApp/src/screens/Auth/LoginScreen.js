import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';

export default function LoginScreen() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Completá ambos campos');
      return;
    }
    await login(email.trim(), password);
  };

  const handleGoogleLogin = () => showToast('Login con Google (próximamente)');

  return (
    <View style={styles.wrapper}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <View style={styles.card}>
        <InputField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail" />
        <InputField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed" />
        <TouchableOpacity style={styles.forgot} onPress={() => showToast('Funcionalidad próximamente')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <PrimaryButton title="Iniciar sesión" loading={loading} onPress={handleLogin} icon="log-in" />
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Ingresar con Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate(ROUTES.REGISTER)} disabled={loading}>
          <Text style={styles.linkBtnText}>¿No tenés cuenta? <Text style={styles.linkBold}>Registrate</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  card: { backgroundColor: '#f7f7f7', borderRadius: 16, marginHorizontal: 16, padding: 16, elevation: 3 },
  forgot: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 12 },
  forgotText: { color: '#007aff', fontWeight: '600' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#db4437', padding: 12, borderRadius: 8, justifyContent: 'center', marginTop: 10 },
  googleBtnText: { color: '#fff', fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 10 },
  linkBtnText: { color: '#333' },
  linkBold: { color: '#007aff', fontWeight: 'bold' },
});
