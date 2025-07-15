import React from 'react';
import { View, Text } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 40 }}>
      <AuthHeader eslogan="Panel del Conductor — activá tu disponibilidad" />
      <Text style={{ marginTop: 24, fontSize: 22 }}>¡Bienvenido, conductor!</Text>
    </View>
  );
}
