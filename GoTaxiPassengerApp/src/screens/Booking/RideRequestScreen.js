import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function RideRequestScreen({ navigation }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleRequest = () => {
    if (!origin || !destination) {
      alert('Por favor completá los campos.');
      return;
    }

    // Lógica simulada: ir a seguimiento
    navigation.navigate('RideTracking', { origin, destination });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar un Taxi</Text>

      <TextInput
        placeholder="Dirección de Origen"
        value={origin}
        onChangeText={setOrigin}
        style={styles.input}
      />

      <TextInput
        placeholder="Dirección de Destino"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />

      <Button title="Solicitar Viaje" onPress={handleRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});
