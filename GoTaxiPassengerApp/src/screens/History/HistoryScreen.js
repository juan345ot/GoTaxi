import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  const [history] = useState([
    { id: '1', origin: 'Calle 1', destination: 'Avenida 3', date: '2024-06-01' },
    { id: '2', origin: 'Plaza Central', destination: 'Estación Norte', date: '2024-06-05' },
    { id: '3', origin: 'Hospital', destination: 'Universidad', date: '2024-06-09' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.line}>🗓 {item.date}</Text>
            <Text style={styles.line}>📍 {item.origin} → {item.destination}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  line: {
    fontSize: 16,
  },
});
