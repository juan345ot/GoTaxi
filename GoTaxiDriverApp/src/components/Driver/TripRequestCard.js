import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TripRequestCard({
  trip,
  onAccept,
  onReject,
}) {
  return (
    <View style={{
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 14,
      backgroundColor: '#fff',
      marginVertical: 10,
      padding: 18,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2
    }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
        {trip.origen} → {trip.destino}
      </Text>
      <Text>Pasajero: {trip.pasajero} ({trip.rating} ★)</Text>
      <Text>Motivo: {trip.motivo}</Text>
      <Text>Monto: ${trip.monto}</Text>
      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginRight: 14, flex: 1 }}
          onPress={onAccept}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#eee', padding: 12, borderRadius: 8, flex: 1 }}
          onPress={onReject}
        >
          <Text style={{ color: '#d32f2f', textAlign: 'center', fontWeight: 'bold' }}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
