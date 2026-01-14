import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as userApi from '../../api/user';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const validate = useCallback(() => {
    if (!currentPassword?.trim()) {
      return 'La contraseña actual es obligatoria';
    }
    if (!newPassword?.trim()) {
      return 'La nueva contraseña es obligatoria';
    }
    if (newPassword.length < 6) {
      return 'La nueva contraseña debe tener al menos 6 caracteres';
    }
    if (newPassword !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (currentPassword === newPassword) {
      return 'La nueva contraseña debe ser diferente a la actual';
    }
    return null;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleChangePassword = useCallback(async() => {
    const error = validate();
    if (error) {
      showToast(error);
      return;
    }

    setLoading(true);
    try {
      await userApi.updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      showToast('Contraseña actualizada exitosamente');
      navigation.goBack();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'No se pudo cambiar la contraseña';
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, validate, navigation]);

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
          <View style={styles.fieldsContainer}>
            <InputField
              label="Contraseña Actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Ingresa tu contraseña actual"
              icon="lock-closed"
              secureTextEntry
            />
            <InputField
              label="Nueva Contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              icon="lock-closed"
              secureTextEntry
            />
            <InputField
              label="Confirmar Nueva Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la nueva contraseña"
              icon="lock-closed"
              secureTextEntry
              isPassword
            />
          </View>

          <PrimaryButton
            title="Cambiar Contraseña"
            icon="lock-closed"
            onPress={handleChangePassword}
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
  fieldsContainer: {
    marginBottom: 20,
  },
});
