import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapPreview() {
  return (
    <View style={styles.container}>
      <Text>Vista previa del mapa (componente temporal)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
});
