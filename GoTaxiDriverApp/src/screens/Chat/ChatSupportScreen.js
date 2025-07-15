import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatSupportScreen() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([
    { id: 1, texto: '¡Bienvenido al chat de soporte! ¿En qué podemos ayudarte?', tipo: 'soporte' },
  ]);

  const enviarMensaje = () => {
    if (!mensaje.trim()) return;
    setMensajes(prev => [
      ...prev,
      { id: prev.length + 1, texto: mensaje, tipo: 'usuario' },
      // Simulación de respuesta automática
      { id: prev.length + 2, texto: 'Gracias por tu consulta. Un operador te responderá a la brevedad.', tipo: 'soporte' }
    ]);
    setMensaje('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1, padding: 14, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' }}>Soporte</Text>
        <FlatList
          data={mensajes}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{
              alignSelf: item.tipo === 'usuario' ? 'flex-end' : 'flex-start',
              backgroundColor: item.tipo === 'usuario' ? '#007aff' : '#eee',
              padding: 10,
              borderRadius: 10,
              marginVertical: 3,
              maxWidth: '75%',
            }}>
              <Text style={{
                color: item.tipo === 'usuario' ? '#fff' : '#222'
              }}>{item.texto}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        <View style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderTopWidth: 1, borderColor: '#eee',
          padding: 8,
          alignItems: 'center'
        }}>
          <TextInput
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Escribe tu mensaje..."
            style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              paddingHorizontal: 12,
              marginRight: 8,
              borderWidth: 1,
              borderColor: '#eee'
            }}
          />
          <TouchableOpacity onPress={enviarMensaje} style={{
            backgroundColor: '#007aff',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
