import React from 'react';
import { ScrollView, Text, Linking, TouchableOpacity } from 'react-native';

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Ayuda y Soporte</Text>
      <Text>¿Tenés dudas o problemas?</Text>
      <Text style={{ marginTop: 10 }}>
        📧 <Text style={{ color: '#007aff' }} onPress={() => Linking.openURL('mailto:soporte@gotaxi.com')}>soporte@gotaxi.com</Text>
      </Text>
      <Text style={{ marginTop: 18 }}>Ver preguntas frecuentes y guías en la web.</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://gotaxi.com/ayuda')}
        style={{ backgroundColor: '#ffd600', marginTop: 14, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#007aff', textAlign: 'center' }}>Ir a Centro de Ayuda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
