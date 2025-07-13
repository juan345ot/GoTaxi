import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <Text style={styles.welcome}>
        Bienvenido a GoTaxi, la manera más simple de pedir un taxi.
      </Text>
      {/* Agregá aquí tu lógica de pedir viaje */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  welcome: {
    marginTop: 30,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});
