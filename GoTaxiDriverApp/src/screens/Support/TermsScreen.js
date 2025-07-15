import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Términos y Condiciones</Text>
      <Text>
        Aquí se mostrará el texto legal completo de la plataforma. Al usar la app, aceptás estos términos...
      </Text>
      {/* Aquí pegá el texto real */}
    </ScrollView>
  );
}
