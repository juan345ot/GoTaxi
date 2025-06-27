import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text } from 'react-native';
import TripItem from '../../components/booking/TripItem';
import { colors } from '../../styles/theme';

const MOCK_TRIPS = [
  {
    id: '1',
    origin: 'Calle 123',
    destination: 'Av. Libertador',
    date: '2025-06-28T14:30:00Z',
    status: 'finalizado',
  },
  {
    id: '2',
    origin: 'San Martín',
    destination: 'Belgrano',
    date: '2025-06-27T10:15:00Z',
    status: 'cancelado',
  },
];

export default function HistoryScreen() {
  const [query, setQuery] = useState('');

  const filteredTrips = MOCK_TRIPS.filter(
    (trip) =>
      trip.origin.toLowerCase().includes(query.toLowerCase()) ||
      trip.destination.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }) => <TripItem trip={item} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>

      <TextInput
        placeholder="Buscar por origen o destino"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {filteredTrips.length > 0 ? (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.empty}>No se encontraron viajes</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.text,
  },
  input: {
    height: 42,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 16,
    color: colors.text,
  },
  list: {
    paddingBottom: 10,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
    fontSize: 16,
  },
});
