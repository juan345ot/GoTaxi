import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthHeader from '../../components/common/AuthHeader';
import ActiveSwitch from '../../components/Driver/ActiveSwitch';
import PenaltyBanner from '../../components/Driver/PenaltyBanner';

export default function HomeScreen({ navigation }) {
  const [isActive, setIsActive] = useState(false);
  const [penaltyLevel, setPenaltyLevel] = useState(0); // 0 = sin penalidad, 1 = warning, 2 = penalización

  // Simulador de penalizaciones visuales para probar la UI
  // Cuando tengas lógica real de rechazos, este estado lo vas a actualizar en base a esa lógica
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 30 }}>
      <AuthHeader eslogan={isActive ? "¡Estás disponible para recibir viajes!" : "Activa tu disponibilidad para comenzar"} />

      {/* Penalización visual */}
      <PenaltyBanner penaltyLevel={penaltyLevel} />

      {/* Simulación: solo para pruebas, podés ocultar estos botones después */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 8 }}>
        <TouchableOpacity onPress={() => setPenaltyLevel(1)} style={{ marginRight: 10, backgroundColor: '#ff9800', padding: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Warning</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPenaltyLevel(2)} style={{ marginRight: 10, backgroundColor: '#d32f2f', padding: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Penalizar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPenaltyLevel(0)} style={{ backgroundColor: '#10b981', padding: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Reset</Text>
        </TouchableOpacity>
      </View>

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
