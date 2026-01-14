import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../navigation/routes';

const RegisterScreen = memo(function RegisterScreen() {
  const { register, loading } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: '', lastname: '', email: '', password: '', confirmPassword: '',
  });

  const set = useCallback((k, v) => setForm(prev => ({ ...prev, [k]: v })), []);

  const validate = useCallback(() => {
    const f = form;

    // Validar campos obligatorios
    if (!f.name?.trim()) return 'El nombre es obligatorio';
    if (!f.lastname?.trim()) return 'El apellido es obligatorio';
    if (!f.email?.trim()) return 'El correo electrónico es obligatorio';
    if (!f.password?.trim()) return 'La contraseña es obligatoria';
    if (!f.confirmPassword?.trim()) return 'Debe confirmar la contraseña';

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email)) return 'El formato del correo electrónico no es válido';

    // Validar contraseña
    if (f.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (f.password !== f.confirmPassword) return 'Las contraseñas no coinciden';

    return null;
  }, [form]);

  const handleRegister = useCallback(async() => {
    const err = validate();
    if (err) return showToast(err);
    const ok = await register({
      nombre: form.name,
      apellido: form.lastname,
      email: form.email,
      password: form.password,
      role: 'pasajero',
    });
    if (ok) navigation.replace(ROUTES.LOGIN);
  }, [form, validate, register, navigation]);

  const handleGoogleRegister = useCallback(() => {
    showToast('Registro con Google (próximamente)');
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate(ROUTES.LOGIN);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
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
          label="Nombre"
          value={form.name}
          onChangeText={(v) => set('name', v)}
          placeholder="Ingresa tu nombre"
          icon="person"
        />
        <InputField
          label="Apellido"
          value={form.lastname}
          onChangeText={(v) => set('lastname', v)}
          placeholder="Ingresa tu apellido"
          icon="person"
        />
        <InputField
          label="Correo Electrónico"
          value={form.email}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
          placeholder="ejemplo@correo.com"
          icon="mail"
        />
        <InputField
          label="Contraseña"
          value={form.password}
          onChangeText={(v) => set('password', v)}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
          icon="lock-closed"
        />
        <InputField
          label="Confirmar Contraseña"
          value={form.confirmPassword}
          onChangeText={(v) => set('confirmPassword', v)}
          secureTextEntry
          placeholder="Repite tu contraseña"
          icon="lock-closed"
        />

        <PrimaryButton title="Registrarme" loading={loading} onPress={handleRegister} icon="person-add" />

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleRegister} disabled={loading}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Registrarme con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={handleNavigateToLogin} disabled={loading}>
          <Text style={[styles.linkBtnText, { color: theme.colors.text }]}>
            ¿Ya tenés cuenta? <Text style={[styles.linkBold, { color: theme.colors.primary }]}>Iniciar sesión</Text>
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
  scroll: {
    flex: 1,
  },
  container: {
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

export default RegisterScreen;
