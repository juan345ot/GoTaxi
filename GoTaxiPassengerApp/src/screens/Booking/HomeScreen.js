import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthHeader eslogan="¡Su taxi a un click de distancia!" />
      <Image
        source={require('../../../assets/images/taxi-banner.png')}
        style={styles.banner}
        resizeMode="contain"
      />
      <Text style={styles.welcome}>
        Bienvenido a <Text style={styles.brand}>GoTaxi</Text>.<br />
        La manera más simple, rápida y segura de pedir un taxi en Argentina.
      </Text>
      <TouchableOpacity
        style={styles.rideBtn}
        onPress={() => navigation.navigate('RideRequest')}
      >
        <Ionicons name="car-sport" size={26} color="#fff" style={{ marginRight: 9 }} />
        <Text style={styles.rideBtnText}>¡Pedir un taxi ahora!</Text>
      </TouchableOpacity>
      <View style={styles.tipsBox}>
        <Ionicons name="information-circle" size={20} color="#007aff" />
        <Text style={styles.tipsText}>
          • Compartí tu viaje con un familiar con un solo click {"\n"}
          • Accedé siempre a soporte y emergencia durante tu viaje
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  banner: {
    width: 220,
    height: 120,
    marginTop: 8,
    marginBottom: 10,
  },
  welcome: {
    marginTop: 10,
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 24,
  },
  brand: {
    color: '#007aff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  rideBtn: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#222',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 5 },
  },
  rideBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  tipsBox: {
    backgroundColor: '#eaf6ff',
    padding: 15,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#007aff',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 3 },
    elevation: 1,
    width: '100%',
  },
  tipsText: {
    marginLeft: 8,
    color: '#3771a1',
    fontSize: 14,
    flex: 1,
  },
});
