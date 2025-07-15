import React, { useState } from 'react';
import { View, Text, Alert, FlatList } from 'react-native';
import TripRequestCard from '../../components/Driver/TripRequestCard';

const viajesEjemplo = [
  {
    id: '1',
    origen: 'Calle 9 y 23',
    destino: 'Hospital Municipal',
    pasajero: 'Carlos Díaz',
    rating: 4.8,
    motivo: 'Turno médico',
    monto: 1200,
  },
  {
    id: '2',
    origen: 'Av. San Martín 123',
    destino: 'Terminal',
    pasajero: 'Romina López',
    rating: 5.0,
    motivo: 'Viaje trabajo',
    monto: 950,
  },
];

export default function TripRequestScreen() {
  const [viajes, setViajes] = useState(viajesEjemplo);
  const [rechazos, setRechazos] = useState(0);

  const handleAccept = (id) => {
    Alert.alert('¡Viaje aceptado!', 'Ya podés ver los datos completos del pasajero.');
    setViajes(viajes.filter(v => v.id !== id));
    // Aquí iría navegación al viaje activo
  };

  const handleReject = (id) => {
    setViajes(viajes.filter(v => v.id !== id));
    setRechazos(r => r + 1);
  };

  React.useEffect(() => {
    if (rechazos === 3) {
      Alert.alert('Advertencia', 'Rechazaste 3 viajes seguidos. Si seguís rechazando podrías recibir una penalización.');
    }
    if (rechazos === 5) {
      Alert.alert('Penalización', 'No podés recibir viajes por 10 minutos por rechazar demasiados viajes.');
      // Aquí podrías bloquear temporalmente el switch de disponibilidad.
    }
  }, [rechazos]);

  return (
    <View style={{ flex: 1, padding: 14 }}>
      {viajes.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 60, color: '#888' }}>No hay solicitudes nuevas.</Text>
      ) : (
        <FlatList
          data={viajes}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            <TripRequestCard
              trip={item}
              onAccept={() => handleAccept(item.id)}
              onReject={() => handleReject(item.id)}
            />
          }
        />
      )}
    </View>
  );
}
