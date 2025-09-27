import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { ROUTES } from '../../navigation/routes';

const RegisterScreen = memo(function RegisterScreen() {
  const { register, loading } = useAuth();
  const navigation = useNavigation();

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

  const handleRegister = useCallback(async () => {
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <View style={styles.card}>
        <InputField 
          label="Nombre" 
          value={form.name} 
          onChangeText={(v)=>set('name', v)} 
          placeholder="Ingresa tu nombre"
          icon="person" 
        />
        <InputField 
          label="Apellido" 
          value={form.lastname} 
          onChangeText={(v)=>set('lastname', v)} 
          placeholder="Ingresa tu apellido"
          icon="person" 
        />
        <InputField 
          label="Correo Electrónico" 
          value={form.email} 
          onChangeText={(v)=>set('email', v)} 
          keyboardType="email-address" 
          placeholder="ejemplo@correo.com"
          icon="mail" 
        />
        <InputField 
          label="Contraseña" 
          value={form.password} 
          onChangeText={(v)=>set('password', v)} 
          secureTextEntry 
          placeholder="Mínimo 6 caracteres"
          icon="lock-closed" 
        />
        <InputField 
          label="Confirmar Contraseña" 
          value={form.confirmPassword} 
          onChangeText={(v)=>set('confirmPassword', v)} 
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
          <Text style={styles.linkBtnText}>¿Ya tenés cuenta? <Text style={styles.linkBold}>Iniciar sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  container: { 
    padding: 20,
    paddingBottom: 40,
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

export default RegisterScreen;
