import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hola, ya estoy llegando.', from: 'driver' },
    { id: '2', text: 'Perfecto, te espero en la esquina.', from: 'passenger' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: input,
      from: 'passenger',
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.from === 'passenger' ? styles.passenger : styles.driver,
            ]}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '70%',
  },
  passenger: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  driver: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendText: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});
