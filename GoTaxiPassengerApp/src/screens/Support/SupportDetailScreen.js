import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/common/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { showToast } from '../../utils/toast';

const MOCK_RECLAMOS = [
  {
    id: '1',
    subject: 'Viaje no completado',
    message: 'El conductor no llegó y se me cobró',
    date: '2025-06-26T10:00:00Z',
    status: 'pendiente',
    respuesta: '',
  },
  {
    id: '2',
    subject: 'Olvidé algo en el auto',
    message: '¿Cómo puedo recuperar mi mochila?',
    date: '2025-06-25T15:42:00Z',
    status: 'respondido',
    respuesta: 'Nos comunicamos con el conductor y te avisamos.',
  },
];

export default function SupportDetailScreen() {
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
    error: '#e53935',
    success: '#00C851',
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
  
  const [reclamos, setReclamos] = useState(MOCK_RECLAMOS);
  const [responseInput, setResponseInput] = useState('');

  const handleResponder = (id) => {
    setReclamos((prev) =>
      prev.map((rec) =>
        rec.id === id ?
          { ...rec, status: 'respondido', respuesta: responseInput } :
          rec,
      ),
    );
    showToast('Respuesta enviada (simulada)');
    setResponseInput('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: safeTheme.colors.surface, borderColor: safeTheme.colors.border }]}>
      <Text style={[styles.subject, { color: safeTheme.colors.text }]}>{item.subject}</Text>
      <Text style={[styles.date, { color: safeTheme.colors.textSecondary }]}>{formatDate(item.date)}</Text>
      <Text style={[styles.message, { color: safeTheme.colors.text }]}>{item.message}</Text>
      <Text
        style={[
          styles.status,
          item.status === 'pendiente' ? { color: safeTheme.colors.error } : { color: safeTheme.colors.success },
        ]}
      >
        {item.status === 'pendiente' ? 'Pendiente' : 'Respondido'}
      </Text>
      {item.status === 'respondido' && (
        <Text style={[styles.respuesta, { color: safeTheme.colors.textSecondary }]}>Respuesta: {item.respuesta}</Text>
      )}
      {item.status === 'pendiente' && (
        <>
          <TextInput
            style={[styles.input, { borderColor: safeTheme.colors.border, color: safeTheme.colors.text, backgroundColor: safeTheme.colors.surface }]}
            value={responseInput}
            onChangeText={setResponseInput}
            placeholder="Responder al reclamo..."
            placeholderTextColor={safeTheme.colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: safeTheme.colors.primary }]}
            onPress={() => handleResponder(item.id)}
          >
            <Text style={styles.btnText}>Enviar Respuesta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
      {reclamos.length === 0 ? (
        <EmptyState icon="chatbubble-ellipses" message="Sin reclamos enviados aún" />
      ) : (
        <FlatList
          data={reclamos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontWeight: '700',
    marginBottom: 5,
  },
  respuesta: {
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
  },
  btn: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 2,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
