import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/auth/AuthHeader';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { ROUTES } from '../../navigation/routes';

export default function RegisterScreen() {
  const { register, loading } = useAuth();
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: '', lastname: '', dni: '', birthdate: '',
    email: '', password: '', confirmPassword: '',
    address: '', city: '', province: '', country: 'Argentina',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const f = form;
    if (Object.values({
      name:f.name, lastname:f.lastname, dni:f.dni, birthdate:f.birthdate,
      email:f.email, password:f.password, confirmPassword:f.confirmPassword,
      address:f.address, city:f.city, province:f.province, country:f.country
    }).some(v => !v)) return 'Todos los campos son obligatorios';
    if (f.password !== f.confirmPassword) return 'Las contraseñas no coinciden';
    if (!/^\d{8}$/.test(f.dni)) return 'El DNI debe tener 8 números';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return showToast(err);
    const ok = await register({
      name: form.name,
      lastName: form.lastname,
      dni: form.dni,
      birthdate: form.birthdate,
      email: form.email,
      password: form.password,
      address: form.address,
      city: form.city,
      province: form.province,
      country: form.country,
      role: 'user',
    });
    if (ok) navigation.replace(ROUTES.LOGIN);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <View style={styles.card}>
        <InputField label="Nombre" value={form.name} onChangeText={(v)=>set('name', v)} icon="person" />
        <InputField label="Apellido" value={form.lastname} onChangeText={(v)=>set('lastname', v)} icon="person" />
        <InputField label="DNI" value={form.dni} onChangeText={(v)=>set('dni', v)} keyboardType="numeric" icon="card" />
        <InputField label="Fecha de Nacimiento" value={form.birthdate} onChangeText={(v)=>set('birthdate', v)} placeholder="DD/MM/AAAA" icon="calendar" />
        <InputField label="Correo" value={form.email} onChangeText={(v)=>set('email', v)} keyboardType="email-address" icon="mail" />
        <InputField label="Contraseña" value={form.password} onChangeText={(v)=>set('password', v)} secureTextEntry icon="lock-closed" />
        <InputField label="Confirmar Contraseña" value={form.confirmPassword} onChangeText={(v)=>set('confirmPassword', v)} secureTextEntry icon="lock-closed" />
        <InputField label="Dirección" value={form.address} onChangeText={(v)=>set('address', v)} icon="location" />
        <InputField label="Ciudad" value={form.city} onChangeText={(v)=>set('city', v)} icon="business" />
        <InputField label="Provincia" value={form.province} onChangeText={(v)=>set('province', v)} icon="flag" />
        <InputField label="País" value={form.country} onChangeText={(v)=>set('country', v)} icon="earth" />

        <PrimaryButton title="Registrarme" loading={loading} onPress={handleRegister} icon="person-add" />

        <TouchableOpacity style={styles.googleBtn} onPress={() => showToast('Registro con Google (próximamente)')} disabled={loading}>
          <Ionicons name="logo-google" size={22} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.googleBtnText}>Registrarme con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate(ROUTES.LOGIN)} disabled={loading}>
          <Text style={styles.linkBtnText}>¿Ya tenés cuenta? <Text style={styles.linkBold}>Iniciar sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  card: { backgroundColor: '#f7f7f7', borderRadius: 16, padding: 16, elevation: 3 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#db4437', padding: 12, borderRadius: 8, justifyContent: 'center', marginTop: 10 },
  googleBtnText: { color: '#fff', fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 10 },
  linkBtnText: { color: '#333' },
  linkBold: { color: '#007aff', fontWeight: 'bold' },
});
