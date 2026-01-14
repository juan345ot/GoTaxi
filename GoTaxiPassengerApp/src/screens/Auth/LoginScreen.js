import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../navigation/routes';

const LoginScreen = memo(function LoginScreen() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
    }
  }, [isAuthenticated]);

  const handleLogin = useCallback(async() => {
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
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.themeToggleContainer}>
          <View style={styles.themeToggleRow}>
            <Ionicons 
              name={theme.isDarkMode ? 'moon' : 'sunny'} 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.themeIcon}
            />
            <Text style={[styles.themeLabel, { color: theme.colors.textSecondary }]}>
              {theme.isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </Text>
            <Switch
              value={theme.isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E7EB', true: '#007AFF' }}
              thumbColor={theme.isDarkMode ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>
        <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <PrimaryButton title="Iniciar sesión" loading={loading} onPress={handleLogin} icon="log-in" />
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
            <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
            <Text style={styles.googleBtnText}>Ingresar con Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={handleNavigateToRegister} disabled={loading}>
            <Text style={[styles.linkBtnText, { color: theme.colors.text }]}>
              ¿No tenés cuenta? <Text style={[styles.linkBold, { color: theme.colors.primary }]}>Registrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  themeToggleContainer: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeIcon: {
    marginRight: 4,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
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
    marginBottom: 16,
  },
  forgotText: {
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
    marginTop: 20,
  },
  linkBtnText: {
    fontSize: 16,
  },
  linkBold: {
    fontWeight: '700',
  },
});

export default LoginScreen;
