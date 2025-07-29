import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import { colors } from '../../styles/theme';
import * as chatApi from '../../api/chat'; // 🚀 Nuevo servicio real

export default function ChatScreen({ route }) {
  const { rideId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Cargar mensajes reales desde la API al iniciar
  useEffect(() => {
    let polling;
    if (!rideId) return;

    const loadMessages = async () => {
      try {
        const msgs = await chatApi.getMessages(rideId);
        setMessages(msgs);
      } catch {
        setMessages([]);
      }
    };

    loadMessages();
    // Opcional: polling cada 4s si no usás WebSocket
    polling = setInterval(loadMessages, 4000);
    return () => clearInterval(polling);
  }, [rideId]);

  // 2. Enviar mensaje (POST a la API o vía socket)
  const handleSend = async () => {
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
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messages: {
    padding: 10,
    paddingBottom: 5,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
