import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import TripItem from '../../components/booking/TripItem';
import { colors } from '../../styles/theme';
import * as rideApi from '../../api/ride'; // 🚀 Nuevo servicio real

const PAYMENT_METHODS = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Mercado Pago', value: 'mp' },
];

export default function HistoryScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchTrips = async () => {
      try {
        const data = await rideApi.getUserRides(); // 🚀 Trae todos los viajes del usuario autenticado
        if (isMounted) setTrips(data);
      } catch {
        if (isMounted) setTrips([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTrips();
    return () => { isMounted = false; };
  }, []);

  const filteredTrips = trips.filter(
    (trip) =>
      (trip.origin?.toLowerCase().includes(query.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(query.toLowerCase())) &&
      (paymentFilter ? trip.paymentMethod === paymentFilter : true)
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />
      ) : filteredTrips.length > 0 ? (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item._id}
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
