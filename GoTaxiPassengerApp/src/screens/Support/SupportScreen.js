import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';

export default function SupportScreen() {
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
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reclamos, setReclamos] = useState([]); // Simulación local
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSubmit = () => {
    if (!subject || !message) {
      showToast('Completá todos los campos');
      return;
    }
    setReclamos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        subject,
        message,
        date: new Date().toISOString(),
        status: 'pendiente',
        respuesta: '',
      },
    ]);
    showToast('Mensaje enviado al soporte');
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.title, { color: safeTheme.colors.text }]}>Soporte Técnico</Text>
      <Text style={[styles.subtitle, { color: safeTheme.colors.textSecondary }]}>Escribinos y te responderemos a la brevedad</Text>
      <InputField
        label="Asunto"
        value={subject}
        onChangeText={setSubject}
        placeholder="Ej: Problema con el viaje"
        icon="help-circle"
      />

      <InputField
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        placeholder="Escribí tu consulta"
        icon="chatbubble-ellipses"
      />

      <PrimaryButton title="Enviar" icon="send" onPress={handleSubmit} />
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
});
