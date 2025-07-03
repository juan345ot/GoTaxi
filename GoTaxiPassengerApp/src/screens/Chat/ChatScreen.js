import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import { colors } from '../../styles/theme';

const STORAGE_KEY = 'gotaxi_chat_messages';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar mensajes al iniciar
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setMessages(stored ? JSON.parse(stored) : [
        {
          id: '1',
          text: '¡Hola! Estoy en camino.',
          time: new Date().toISOString(),
          isOwn: false,
        },
        {
          id: '2',
          text: 'Perfecto, gracias!',
          time: new Date().toISOString(),
          isOwn: true,
        },
      ]);
    })();
  }, []);

  // Guardar mensajes al modificar
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      time: new Date().toISOString(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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
