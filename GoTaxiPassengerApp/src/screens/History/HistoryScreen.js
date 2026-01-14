import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import TripItem from '../../components/booking/TripItem';
import { useTheme } from '../../contexts/ThemeContext';
import * as rideApi from '../../api/ride'; // 🚀 Nuevo servicio real

const PAYMENT_METHODS = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Mercado Pago', value: 'mp' },
];

const STATUS_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Completados', value: 'completed' },
  { label: 'Cancelados', value: 'cancelled' },
  { label: 'En curso', value: 'in_progress' },
];

export default function HistoryScreen() {
  const navigation = useNavigation();

  // Obtener tema con validación robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }

  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };

  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }

  // Garantizar que colors siempre exista
  if (!theme || !theme.colors) {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }

  // Validación final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchTrips = async() => {
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
      return () => {
        isMounted = false;
      };
    }, []),
  );

  const filteredTrips = (Array.isArray(trips) ? trips : []).filter(
    (trip) => {
      const matchesQuery = trip.origin?.toLowerCase().includes(query.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(query.toLowerCase());
      const matchesPayment = paymentFilter ? trip.paymentMethod === paymentFilter : true;

      const status = (trip.status || trip.estado || '').toLowerCase();
      const matchesStatus = !statusFilter ? true :
        (statusFilter === 'cancelled' ? status.includes('cancel') :
          statusFilter === 'completed' ? (status.includes('complet') || status === 'completed') :
            statusFilter === 'in_progress' ? (status.includes('curso') || status.includes('progress') || status.includes('pendiente')) :
              status === statusFilter);

      return matchesQuery && matchesPayment && matchesStatus;
    },
  );

  const renderItem = ({ item }) => <TripItem trip={item} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: safeTheme.colors.text }]}>Historial de Viajes</Text>

        <TextInput
          placeholder="Buscar por origen o destino"
          placeholderTextColor={safeTheme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={[styles.input, {
            borderColor: safeTheme.colors.border,
            color: safeTheme.colors.text,
            backgroundColor: safeTheme.colors.surface,
          }]}
        />

        <View style={styles.paymentFilter}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              onPress={() => setPaymentFilter(method.value)}
              style={[
                styles.methodBtn,
                {
                  borderColor: safeTheme.colors.border,
                  backgroundColor: safeTheme.colors.surface,
                },
                paymentFilter === method.value && {
                  backgroundColor: safeTheme.colors.primary,
                  borderColor: safeTheme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.methodBtnText,
                  { color: safeTheme.colors.textSecondary },
                  paymentFilter === method.value && styles.methodBtnTextActive,
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.paymentFilter}>
          {STATUS_FILTERS.map((status) => (
            <TouchableOpacity
              key={status.value}
              onPress={() => setStatusFilter(status.value)}
              style={[
                styles.methodBtn,
                {
                  borderColor: safeTheme.colors.border,
                  backgroundColor: safeTheme.colors.surface,
                },
                statusFilter === status.value && {
                  backgroundColor: safeTheme.colors.primary,
                  borderColor: safeTheme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.methodBtnText,
                  { color: safeTheme.colors.textSecondary },
                  statusFilter === status.value && styles.methodBtnTextActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />
        ) : filteredTrips.length > 0 ? (
          <FlatList
            data={filteredTrips}
            keyExtractor={(item, index) => item._id || item.id || `trip-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        ) : (
          <Text style={[styles.empty, { color: safeTheme.colors.textSecondary }]}>No se encontraron viajes</Text>
        )}
      </View>
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  paymentFilter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  methodBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  methodBtnText: {
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
    marginTop: 40,
    fontSize: 16,
  },
});
