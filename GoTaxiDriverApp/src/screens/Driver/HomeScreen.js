import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import ActiveSwitch from '../../components/Driver/ActiveSwitch';

export default function HomeScreen({ navigation }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 30 }}>
      <AuthHeader eslogan={isActive ? "¡Estás disponible para recibir viajes!" : "Activa tu disponibilidad para comenzar"} />
      <ActiveSwitch isActive={isActive} setIsActive={setIsActive} />

      <View style={{ width: '90%', marginTop: 30 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#007aff', padding: 18, borderRadius: 10, marginBottom: 16 }}
          onPress={() => navigation.navigate('TripRequestScreen')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 17 }}>Solicitudes de Viaje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#ffd600', padding: 18, borderRadius: 10, marginBottom: 16 }}
          onPress={() => navigation.navigate('HistoryScreen')}
        >
          <Text style={{ color: '#333', fontWeight: 'bold', textAlign: 'center', fontSize: 17 }}>Historial de Viajes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#f5f5f5', padding: 18, borderRadius: 10, marginBottom: 16 }}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={{ color: '#007aff', fontWeight: 'bold', textAlign: 'center', fontSize: 17 }}>Mi Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#f5f5f5', padding: 18, borderRadius: 10 }}
          onPress={() => navigation.navigate('ChatSupportScreen')}
        >
          <Text style={{ color: '#007aff', fontWeight: 'bold', textAlign: 'center', fontSize: 17 }}>Soporte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
