import React from 'react';
import { View, Text } from 'react-native';

export default function EarningsHistoryScreen() {
  // A futuro: sumar gráficos, filtros por mes
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Historial de Ganancias</Text>
      <Text>🚧 Próximamente: gráficos y resumen mensual.</Text>
    </View>
  );
}
