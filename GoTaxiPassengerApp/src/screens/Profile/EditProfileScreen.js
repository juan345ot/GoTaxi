import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import ProfileField from '../../components/common/ProfileField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import avatarImg from '../../../assets/images/avatar-default.png';
import * as userApi from '../../api/user';

export default function EditProfileScreen({ navigation, route }) {
  // Tomá el perfil de los params para pre-cargar los datos
  const { profile } = route.params || {};

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSave = async () => {
    try {
      await userApi.updateProfile({ name, phone });
      showToast('Perfil actualizado');
      navigation.goBack();
    } catch {
      showToast('No se pudo actualizar el perfil');
    }
  };

  const handlePickAvatar = () => {
    showToast('Funcionalidad de subir foto próximamente');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
        <Image source={avatarImg} style={styles.avatar} resizeMode="cover" />
        <Text style={styles.avatarText}>Cambiar foto</Text>
      </TouchableOpacity>
      <ProfileField label="Nombre" value={name} onChangeText={setName} />
      <ProfileField label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <PrimaryButton title="Guardar cambios" icon="save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#eee', marginBottom: 4 },
  avatarText: { color: '#777', fontSize: 13 },
});
