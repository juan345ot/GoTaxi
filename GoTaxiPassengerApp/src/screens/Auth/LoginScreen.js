import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirige si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      return showToast('Completá ambos campos');
    }
    try {
      await login(email, password);
      // El AuthContext maneja el toast y el isAuthenticated redirige a Home
    } catch (e) {
      // El error ya se muestra por showToast en AuthContext
    }
  };

  const handleGoogleLogin = () => {
    showToast('Login con Google (pronto disponible)');
    // Implementar Google login luego
  };

  return (
    <View style={styles.wrapper}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />

      <View style={styles.card}>
        <InputField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@email.com"
          icon="mail"
          keyboardType="email-address"
          editable={!loading}
        />
        <InputField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="******"
          icon="lock-closed"
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity style={styles.forgot} onPress={() => showToast('Funcionalidad próximamente')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <PrimaryButton title="Iniciar sesión" loading={loading} onPress={handleLogin} icon="log-in" disabled={loading} />

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Ingresar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={styles.linkBtnText}>
            ¿No tenés cuenta? <Text style={styles.linkBold}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...igual que antes...
  wrapper: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  card: { backgroundColor: '#f7f7f7', borderRadius: 20, marginHorizontal: 16, padding: 24, shadowColor: '#222', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 12, elevation: 7 },
  forgot: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 14 },
  forgotText: { color: '#007aff', fontWeight: '600', fontSize: 14 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e94235', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', marginBottom: 14 },
  googleBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
  linkBtnText: { color: '#333', fontSize: 15 },
  linkBold: { color: '#007aff', fontWeight: 'bold' },
});
