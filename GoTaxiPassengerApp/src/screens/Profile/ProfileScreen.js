import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import ProfileField from '../../components/common/ProfileField';
import PrimaryButton from '../../components/common/PrimaryButton';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import * as userApi from '../../api/user';
import avatarImg from '../../../assets/images/avatar-default.png';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile(data);
      } catch {
        showToast('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#007aff" />;
  if (!profile) return <Text style={{ margin: 40, textAlign: 'center' }}>No se encontró el perfil.</Text>;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => showToast('Funcionalidad de subir foto próximamente')} style={styles.avatarWrapper}>
        <Image
          source={avatarImg}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.avatarText}>Cambiar foto</Text>
      </TouchableOpacity>
      <ProfileField label="Nombre" value={profile.name} editable={false} />
      <ProfileField label="Correo" value={profile.email} editable={false} />
      <ProfileField label="Teléfono" value={profile.phone || ''} editable={false} />
      <PrimaryButton title="Editar Perfil" icon="create" onPress={() => navigation.navigate('EditProfile', { profile })} />
      <PrimaryButton title="Cerrar Sesión" icon="log-out" onPress={logout} style={{ marginTop: 15, backgroundColor: '#e53935' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#eee', marginBottom: 4 },
  avatarText: { color: '#777', fontSize: 13 },
});
