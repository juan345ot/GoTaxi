import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useToast } from '../../components/common/Toast';

const PASAJERO = {
  nombre: 'Romina López',
  telefono: '+5492991234567',
  whatsapp: '+5492991234567',
  destino: 'Terminal',
  monto: 950,
};

export default function CurrentTripScreen({ navigation }) {
  const { showToast } = useToast();
  const [pasajeroSubio, setPasajeroSubio] = useState(false);
  const [confirmarPago, setConfirmarPago] = useState(false);

  const handleSOS = () => {
    showToast('SOS enviado. Emergencias y contactos avisados.', '#d32f2f');
  };

  const handleCompartir = () => {
    showToast('Función próxima: compartir ubicación en tiempo real', '#ffd600');
  };

  const handleConfirmarSubida = () => {
    setPasajeroSubio(true);
    showToast('¡Listo! Ahora podés iniciar el viaje.', '#10b981');
  };

  const handleTerminarViaje = () => {
    setConfirmarPago(true);
  };

  const handleConfirmarPago = () => {
    showToast('Pago confirmado', '#10b981');
    navigation.navigate('PassengerRatingScreen');
  };

  const llamarPasajero = () => {
    showToast('Abriendo llamada...', '#007aff');
    Linking.openURL(`tel:${PASAJERO.telefono}`);
  };

  const mensajePasajero = () => {
    showToast('Abriendo WhatsApp...', '#25d366');
    const msg = encodeURIComponent('¡Hola! Soy tu conductor de GoTaxi, ¿listo para el viaje?');
    Linking.openURL(`https://wa.me/${PASAJERO.whatsapp.replace('+', '')}?text=${msg}`);
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
      <Text>Pasajero: {PASAJERO.nombre}</Text>
      <Text>Destino: {PASAJERO.destino}</Text>
      <Text>Monto: ${PASAJERO.monto}</Text>

      <View style={{ flexDirection: 'row', marginTop: 18, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={llamarPasajero}
          style={{
            backgroundColor: '#10b981',
            padding: 12,
            borderRadius: 8,
            marginRight: 12,
            flex: 1,
            alignItems: 'center'
          }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Llamar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={mensajePasajero}
          style={{
            backgroundColor: '#25d366',
            padding: 12,
            borderRadius: 8,
            flex: 1,
            alignItems: 'center'
          }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={handleSOS}
          style={{ backgroundColor: '#d32f2f', padding: 14, borderRadius: 8, marginRight: 16 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCompartir}
          style={{ backgroundColor: '#ffd600', padding: 14, borderRadius: 8 }}>
          <Text style={{ color: '#222', fontWeight: 'bold' }}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {!pasajeroSubio && (
        <TouchableOpacity
          onPress={handleConfirmarSubida}
          style={{ backgroundColor: '#007aff', padding: 14, borderRadius: 8, marginTop: 30, width: '70%' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Confirmar que el pasajero subió</Text>
        </TouchableOpacity>
      )}

      {pasajeroSubio && (
        <TouchableOpacity
          onPress={handleTerminarViaje}
          style={{ backgroundColor: '#10b981', padding: 14, borderRadius: 8, marginTop: 30, width: '70%' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Terminar viaje / Confirmar pago</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
