import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';

const viajesMock = [
  {
    id: 'v001',
    origen: 'Terminal',
    destino: 'Calle 33 y 18',
    fecha: '2025-07-15 09:42',
    monto: 1500,
    comision: 150,
    neto: 1350,
  },
  {
    id: 'v002',
    origen: 'Hospital Municipal',
    destino: 'Centro',
    fecha: '2025-07-14 16:08',
    monto: 950,
    comision: 95,
    neto: 855,
  },
];

export default function HistoryScreen() {
  const [viajes, setViajes] = useState(viajesMock);

  return (
    <View style={{ flex: 1, padding: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' }}>Historial de Viajes</Text>
      <FlatList
        data={viajes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{
            borderWidth: 1,
            borderColor: '#eee',
            borderRadius: 12,
            padding: 18,
            marginBottom: 14,
            backgroundColor: '#fff',
            elevation: 1
          }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {item.origen} → {item.destino}
            </Text>
            <Text style={{ color: '#888', marginBottom: 2 }}>Fecha: {item.fecha}</Text>
            <Text>Monto pagado: <Text style={{ fontWeight: 'bold' }}>${item.monto}</Text></Text>
            <Text>Comisión plataforma: <Text style={{ color: '#d32f2f' }}>${item.comision}</Text></Text>
            <Text>Neto para vos: <Text style={{ color: '#10b981', fontWeight: 'bold' }}>${item.neto}</Text></Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>Aún no tenés viajes finalizados.</Text>}
      />
    </View>
  );
}
