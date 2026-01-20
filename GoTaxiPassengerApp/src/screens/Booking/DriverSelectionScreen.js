import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/common/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function DriverSelectionScreen({ route, navigation }) {
  const { rideId, origin, destination } = route.params || {};
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

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
    success: '#10B981',
  };

  const safeTheme = themeContext?.theme?.colors || defaultColors;

  useEffect(() => {
    loadAvailableDrivers();
  }, []);

  const loadAvailableDrivers = async () => {
    try {
      setLoading(true);
      const availableDrivers = await rideApi.getAvailableDrivers();
      setDrivers(availableDrivers || []);
      if (!availableDrivers || availableDrivers.length === 0) {
        showToast('No hay conductores disponibles en este momento');
      }
    } catch (error) {
      console.error('Error cargando conductores:', error);
      showToast('Error al cargar conductores disponibles');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = async (driver) => {
    if (!rideId) {
      showToast('Error: ID de viaje no disponible');
      return;
    }

    try {
      setSelecting(true);
      await rideApi.selectDriver(rideId, driver.id);
      showToast(`Conductor ${driver.user.nombre} seleccionado`);
      // Navegar a pantalla de confirmación
      navigation.replace('DriverConfirmation', {
        rideId,
        driver,
        origin,
        destination,
      });
    } catch (error) {
      console.error('Error seleccionando conductor:', error);
      showToast('Error al seleccionar conductor');
    } finally {
      setSelecting(false);
    }
  };

  const renderDriverItem = ({ item }) => {
    const driver = item;
    const vehiculo = driver.vehiculo || {};
    const user = driver.user || {};

    return (
      <TouchableOpacity
        style={[styles.driverCard, { backgroundColor: safeTheme.surface, borderColor: safeTheme.border }]}
        onPress={() => handleSelectDriver(driver)}
        disabled={selecting}
      >
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            {user.foto ? (
              <Image source={{ uri: user.foto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: safeTheme.primary }]}>
                <Text style={styles.avatarText}>
                  {user.nombre?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.driverDetails}>
            <Text style={[styles.driverName, { color: safeTheme.text }]}>
              {user.nombre} {user.apellido}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text style={[styles.rating, { color: safeTheme.textSecondary }]}>
                {driver.calificacion?.toFixed(1) || '5.0'}
              </Text>
            </View>
            <Text style={[styles.vehicle, { color: safeTheme.textSecondary }]}>
              {vehiculo.marca} {vehiculo.modelo} • {vehiculo.color}
            </Text>
            <Text style={[styles.plate, { color: safeTheme.textSecondary }]}>
              {vehiculo.patente || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.selectButtonContainer}>
          <View style={[styles.selectButton, { backgroundColor: safeTheme.success }]}>
            <Text style={styles.selectButtonText}>Seleccionar</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.background }]}>
        <AppHeader showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={safeTheme.primary} />
          <Text style={[styles.loadingText, { color: safeTheme.textSecondary }]}>
            Buscando conductores disponibles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.background }]}>
      <AppHeader showBackButton={true} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: safeTheme.text }]}>
          Conductores Disponibles
        </Text>
        <Text style={[styles.subtitle, { color: safeTheme.textSecondary }]}>
          Seleccioná el conductor que prefieras
        </Text>

        {drivers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={safeTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: safeTheme.textSecondary }]}>
              No hay conductores disponibles en este momento
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: safeTheme.primary }]}
              onPress={loadAvailableDrivers}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={drivers}
            renderItem={renderDriverItem}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  driverCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
  },
  vehicle: {
    fontSize: 14,
    marginBottom: 2,
  },
  plate: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectButtonContainer: {
    marginLeft: 12,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
