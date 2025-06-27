import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';

const TripItem = ({ origin, destination, date }) => (
  <View style={styles.item}>
    <Text style={styles.date}>🗓 {date}</Text>
    <Text style={styles.route}>📍 {origin} → {destination}</Text>
  </View>
);

export default function HistoryScreen() {
  const [filter, setFilter] = useState('');
  const [history] = useState([
    { id: '1', origin: 'Calle 1', destination: 'Avenida 3', date: '2024-06-01' },
    { id: '2', origin: 'Plaza Central', destination: 'Estación Norte', date: '2024-06-05' },
    { id: '3', origin: 'Hospital', destination: 'Universidad', date: '2024-06-09' },
  ]);

  const filteredHistory = history.filter(item =>
    item.origin.toLowerCase().includes(filter.toLowerCase()) ||
    item.destination.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por origen o destino"
        value={filter}
        onChangeText={setFilter}
      />

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripItem
            origin={item.origin}
            destination={item.destination}
            date={item.date}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  date: { fontWeight: 'bold', marginBottom: 4 },
  route: { fontSize: 16 },
});
