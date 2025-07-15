import React from 'react';
import { View, Text } from 'react-native';

export default function LocationSimulator({ lat, lng }) {
  return (
    <View style={{ padding: 12, backgroundColor: '#ffe', borderRadius: 8, margin: 10 }}>
      <Text>Ubicación simulada:</Text>
      <Text>Latitud: {lat}</Text>
      <Text>Longitud: {lng}</Text>
    </View>
  );
}
