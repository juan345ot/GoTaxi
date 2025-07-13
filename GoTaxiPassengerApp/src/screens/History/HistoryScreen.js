import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import TripItem from '../../components/booking/TripItem';
import { colors } from '../../styles/theme';

const MOCK_TRIPS = [
  {
    id: '1',
    origin: 'Calle 123',
    destination: 'Av. Libertador',
    date: '2025-06-28T14:30:00Z',
    status: 'finalizado',
    paymentMethod: 'cash',
    rating: 5,
    driver: 'Carlos Pérez',
    vehicle: 'Toyota Etios Blanco',
  },
  {
    id: '2',
    origin: 'San Martín',
    destination: 'Belgrano',
    date: '2025-06-27T10:15:00Z',
    status: 'cancelado',
    paymentMethod: 'mp',
    rating: 0,
    driver: 'Ricardo López',
    vehicle: 'Renault Logan Gris',
  },
  {
    id: '3',
    origin: 'Rivadavia',
    destination: '9 de Julio',
    date: '2025-06-22T10:00:00Z',
    status: 'finalizado',
    paymentMethod: 'card',
    rating: 3,
    driver: 'Ana Martínez',
    vehicle: 'Chevrolet Prisma Rojo',
  },
];

const PAYMENT_METHODS = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Mercado Pago', value: 'mp' },
];

export default function HistoryScreen() {
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const filteredTrips = MOCK_TRIPS.filter(
    (trip) =>
      (trip.origin.toLowerCase().includes(query.toLowerCase()) ||
        trip.destination.toLowerCase().includes(query.toLowerCase())) &&
      (paymentFilter ? trip.paymentMethod === paymentFilter : true)
  );

  const renderItem = ({ item }) => (
    <TripItem trip={item} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>

      <TextInput
        placeholder="Buscar por origen o destino"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <View style={styles.paymentFilter}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            onPress={() => setPaymentFilter(method.value)}
            style={[
              styles.methodBtn,
              paymentFilter === method.value && styles.methodBtnActive,
            ]}
          >
            <Text
              style={[
                styles.methodBtnText,
                paymentFilter === method.value && styles.methodBtnTextActive,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    color: colors.text || '#333',
  },
  input: {
    height: 42,
    borderColor: colors.border || '#e0e0e0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: colors.text || '#222',
  },
  paymentFilter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  methodBtn: {
    borderWidth: 1,
    borderColor: colors.border || '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  methodBtnActive: {
    backgroundColor: colors.primary || '#007aff',
    borderColor: colors.primaryDark || '#0057b8',
  },
  methodBtnText: {
    color: colors.textSecondary || '#777',
    fontSize: 13,
  },
  methodBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 10,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary || '#777',
    marginTop: 40,
    fontSize: 16,
  },
});
