import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function CurrentTripScreen({ navigation }) {
  const [pasajeroSubio, setPasajeroSubio] = useState(false);
  const [confirmarPago, setConfirmarPago] = useState(false);
  const [pin, setPin] = useState('');

  const handleSOS = () => {
    Alert.alert('SOS', 'Se notificará a emergencias y tus contactos de confianza.');
  };

  const handleCompartir = () => {
    Alert.alert('Compartir viaje', 'Función próxima: compartir ubicación en tiempo real.');
  };

  const handleConfirmarSubida = () => {
    setPasajeroSubio(true);
    Alert.alert('¡Listo!', 'Ahora podés iniciar el viaje.');
  };

  const handleTerminarViaje = () => {
    setConfirmarPago(true);
  };

  const handleConfirmarPago = () => {
    // Aquí puedes validar el PIN
    Alert.alert('Pago confirmado', '¡Gracias por usar GoTaxi Driver!');
    navigation.navigate('PassengerRatingScreen');
  };

  if (confirmarPago) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Text style={{ fontSize: 19, marginBottom: 18 }}>Ingresá el PIN que te mostró el pasajero:</Text>
        <TouchableOpacity
          onPress={handleConfirmarPago}
          style={{ backgroundColor: '#007aff', padding: 14, borderRadius: 8, marginTop: 18, width: '70%' }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Confirmar pago</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 22, alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Viaje en curso</Text>
      <Text>Pasajero: Romina López</Text>
      <Text>Destino: Terminal</Text>
      <Text>Monto: $950</Text>
      {/* Aquí iría el mapa animado real */}
      <View style={{ flexDirection: 'row', marginTop: 26, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={handleSOS}
          style={{ backgroundColor: '#d32f2f', padding: 14, borderRadius: 8, marginRight: 16 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCompartir}
          style={{ backgroundColor: '#ffd600', padding: 14, borderRadius: 8 }}
        >
          <Text style={{ color: '#222', fontWeight: 'bold' }}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {!pasajeroSubio && (
        <TouchableOpacity
          onPress={handleConfirmarSubida}
          style={{ backgroundColor: '#007aff', padding: 14, borderRadius: 8, marginTop: 30, width: '70%' }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Confirmar que el pasajero subió</Text>
        </TouchableOpacity>
      )}

      {pasajeroSubio && (
        <TouchableOpacity
          onPress={handleTerminarViaje}
          style={{ backgroundColor: '#10b981', padding: 14, borderRadius: 8, marginTop: 30, width: '70%' }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Terminar viaje / Confirmar pago</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
