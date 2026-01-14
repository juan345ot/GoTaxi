import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/common/AppHeader';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import { useTheme } from '../../contexts/ThemeContext';
import * as chatApi from '../../api/chat'; // 🚀 Nuevo servicio real

export default function ChatScreen({ route }) {
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
  
  const { rideId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Cargar mensajes reales desde la API al iniciar
  useEffect(() => {
    if (!rideId) return;

    const loadMessages = async() => {
      try {
        const msgs = await chatApi.getMessages(rideId);
        setMessages(msgs);
      } catch {
        setMessages([]);
      }
    };

    loadMessages();
    // Opcional: polling cada 4s si no usás WebSocket
    const polling = setInterval(loadMessages, 4000);
    return () => clearInterval(polling);
  }, [rideId]);

  // 2. Enviar mensaje (POST a la API o vía socket)
  const handleSend = async() => {
    if (!newMessage.trim()) return;
    try {
      await chatApi.sendMessage(rideId, newMessage.trim());
      setNewMessage('');
      // Forzar reload (si no usás socket, con WebSocket no hace falta)
      const msgs = await chatApi.getMessages(rideId);
      setMessages(msgs);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Manejo de error
    }
  };

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} />
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
        <View style={[styles.header, { backgroundColor: safeTheme.colors.primary }]}>
        <Text style={styles.headerText}>Conversación con el conductor</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item.text}
            time={item.time}
            isOwn={item.isOwn}
          />
        )}
        contentContainerStyle={styles.messages}
      />

      <ChatInput
        ref={inputRef}
        value={newMessage}
        onChangeText={setNewMessage}
        onSend={handleSend}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messages: {
    padding: 10,
    paddingBottom: 5,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
