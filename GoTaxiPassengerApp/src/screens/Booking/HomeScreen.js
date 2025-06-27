import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a GoTaxi</Text>
      <Button title="Pedir Taxi" onPress={() => navigation.navigate('RideRequest')} />
      <Button title="Historial de Viajes" onPress={() => navigation.navigate('History')} />
      <Button title="Perfil" onPress={() => navigation.navigate('Profile')} />
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
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
  },
});
