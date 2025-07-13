import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    lastname: '',
    dni: '',
    birthdate: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    province: '',
    country: 'Argentina',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validate = () => {
    const {
      name, lastname, dni, birthdate, email, password,
      confirmPassword, address, city, province, country,
    } = form;

    if (!name || !lastname || !dni || !birthdate || !email || !password || !confirmPassword || !address || !city || !province || !country) {
      return 'Todos los campos son obligatorios';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (dni.length !== 8 || isNaN(dni)) {
      return 'El DNI debe tener 8 números';
    }
    // Podés agregar más validaciones (ej: formato fecha, mail, etc)
    return null;
  };

  const handleRegister = () => {
    const error = validate();
    if (error) return showToast(error);

    register(form.email, form.password); // Simulado
    showToast('Registro exitoso');
    navigation.navigate('Home');
  };

  const handleGoogleRegister = () => {
    showToast('Registro con Google (simulado)');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />

      <View style={styles.card}>
        <InputField label="Nombre" value={form.name} onChangeText={(v) => handleChange('name', v)} icon="person" />
        <InputField label="Apellido" value={form.lastname} onChangeText={(v) => handleChange('lastname', v)} icon="person" />
        <InputField label="DNI" keyboardType="numeric" value={form.dni} onChangeText={(v) => handleChange('dni', v)} icon="card" />
        <InputField label="Fecha de Nacimiento" placeholder="DD/MM/AAAA" value={form.birthdate} onChangeText={(v) => handleChange('birthdate', v)} icon="calendar" />
        <InputField label="Correo" value={form.email} keyboardType="email-address" onChangeText={(v) => handleChange('email', v)} icon="mail" />
        <InputField label="Contraseña" secureTextEntry value={form.password} onChangeText={(v) => handleChange('password', v)} icon="lock-closed" />
        <InputField label="Confirmar Contraseña" secureTextEntry value={form.confirmPassword} onChangeText={(v) => handleChange('confirmPassword', v)} icon="lock-closed" />
        <InputField label="Dirección" value={form.address} onChangeText={(v) => handleChange('address', v)} icon="location" />
        <InputField label="Ciudad" value={form.city} onChangeText={(v) => handleChange('city', v)} icon="business" />
        <InputField label="Provincia" value={form.province} onChangeText={(v) => handleChange('province', v)} icon="flag" />
        <InputField label="País" value={form.country} editable={false} icon="earth" />

        <PrimaryButton title="Registrarme" loading={loading} onPress={handleRegister} icon="person-add" />

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: 30,
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
