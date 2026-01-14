import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProfileField from '../../components/common/ProfileField';
import PrimaryButton from '../../components/common/PrimaryButton';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import * as userApi from '../../api/user';
import { ROUTES } from '../../navigation/routes';
import avatarImg from '../../../assets/images/avatar-default.png';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  
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
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchProfile = async() => {
      try {
        const data = await userApi.getProfile();
        // El backend puede devolver data.data o data directamente
        const profileData = data?.data || data?.user || data;
        setProfile(profileData);
      } catch {
        showToast('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Extraer datos del perfil (antes de los returns condicionales para cumplir reglas de hooks)
  const nombre = profile?.nombre || profile?.name || '';
  const apellido = profile?.apellido || profile?.lastname || '';
  const email = profile?.email || '';
  const telefono = profile?.telefono || profile?.phone || '';
  const direccion = profile?.direccion || profile?.address || '';

  // Asegurar que safeTheme.colors esté disponible antes de renderizar
  const bgColor = safeTheme?.colors?.background || defaultColors.background;
  const txtColor = safeTheme?.colors?.text || defaultColors.text;
  const primColor = safeTheme?.colors?.primary || defaultColors.primary;
  const txtSecColor = safeTheme?.colors?.textSecondary || defaultColors.textSecondary;

  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
      <ActivityIndicator style={{ marginTop: 50 }} size="large" color={primColor} />
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
  if (!profile) return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
      <Text style={[styles.errorText, { color: txtColor }]}>No se encontró el perfil.</Text>
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => showToast('Funcionalidad de subir foto próximamente')} style={styles.avatarWrapper}>
        <Image
          source={profile?.foto || profile?.photo ? { uri: profile.foto || profile.photo } : avatarImg}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={[styles.avatarText, { color: txtSecColor }]}>Cambiar foto</Text>
      </TouchableOpacity>

      <View style={styles.fieldsContainer}>
        <ProfileField label="Nombre" value={nombre} editable={false} />
        <ProfileField label="Apellido" value={apellido} editable={false} />
        <ProfileField label="Correo Electrónico" value={email} editable={false} />
        <ProfileField label="Teléfono" value={telefono || 'No especificado'} editable={false} />
        <ProfileField label="Dirección" value={direccion || 'No especificada'} editable={false} />
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Editar Perfil"
          icon="create"
          onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE, { profile })}
        />
        <PrimaryButton
          title="Cambiar Contraseña"
          icon="lock-closed"
          onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
          style={styles.changePasswordButton}
        />
        <PrimaryButton
          title="Cerrar Sesión"
          icon="log-out"
          onPress={logout}
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
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
    fontSize: 13,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 12,
  },
  changePasswordButton: {
    backgroundColor: '#FFA500',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    marginTop: 8,
  },
  errorText: {
    margin: 40,
    textAlign: 'center',
  },
});
