import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function SupportScreen() {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Por favor escribí tu consulta.');
      return;
    }
    Alert.alert('Enviado', 'Tu mensaje fue enviado al soporte.');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Centro de Soporte</Text>
      <TextInput
        multiline
        placeholder="Escribí tu mensaje o consulta..."
        style={styles.input}
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Enviar" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
    borderRadius: 8,
  },
});
