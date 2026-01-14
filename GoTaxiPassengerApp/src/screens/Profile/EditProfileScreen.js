import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import avatarImg from '../../../assets/images/avatar-default.png';
import * as userApi from '../../api/user';

export default function EditProfileScreen({ route }) {
  const navigation = useNavigation();
  // Tomá el perfil de los params para pre-cargar los datos
  const { profile } = route.params || {};
  
  // Obtener tema con validación robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }
  
  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };
  
  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }
  
  // Garantizar que colors siempre exista
  if (!theme || !theme.colors) {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  
  // Validación final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };

  const [nombre, setNombre] = useState(profile?.nombre || profile?.name || '');
  const [apellido, setApellido] = useState(profile?.apellido || profile?.lastname || '');
  const [telefono, setTelefono] = useState(profile?.telefono || profile?.phone || '');
  const [direccion, setDireccion] = useState(profile?.direccion || profile?.address || '');
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSave = async() => {
    if (!nombre?.trim()) {
      showToast('El nombre es obligatorio');
      return;
    }
    if (!apellido?.trim()) {
      showToast('El apellido es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await userApi.updateProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim() || undefined,
      });
      showToast('Perfil actualizado');
      navigation.goBack();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'No se pudo actualizar el perfil';
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = () => {
    showToast('Funcionalidad de subir foto próximamente');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
          <Image
            source={profile?.foto || profile?.photo ? { uri: profile.foto || profile.photo } : avatarImg}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={[styles.avatarText, { color: safeTheme.colors.textSecondary }]}>Cambiar foto</Text>
        </TouchableOpacity>

        <View style={styles.fieldsContainer}>
          <InputField
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingresa tu nombre"
            icon="person"
          />
          <InputField
            label="Apellido"
            value={apellido}
            onChangeText={setApellido}
            placeholder="Ingresa tu apellido"
            icon="person"
          />
          <InputField
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ingresa tu teléfono"
            icon="call"
            keyboardType="phone-pad"
          />
          <InputField
            label="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Calle, altura, ciudad"
            icon="location"
            multiline
            numberOfLines={2}
          />
        </View>

        <PrimaryButton
          title="Guardar cambios"
          icon="save"
          onPress={handleSave}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#eee',
    marginBottom: 4,
  },
  avatarText: {
    color: '#777',
    fontSize: 13,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
});
