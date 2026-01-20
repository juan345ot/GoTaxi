import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import MapView from 'react-native-maps'; // Descomentar si se usa mapas reales
import * as tripApi from '../../api/tripApi';

const TRIP_STATUSES = {
  ASIGNADO: 'asignado',
  EN_CAMINO: 'en_camino',
  EN_ORIGEN: 'en_origen',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
};

export default function ActiveTripScreen({ route, navigation }) {
  const { tripId, tripData } = route.params || {};
  const [status, setStatus] = useState(TRIP_STATUSES.ASIGNADO);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(tripData || null);

  useEffect(() => {
    if (!trip && tripId) {
      loadTripDetails();
    }
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getTripById(tripId);
      setTrip(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      // Fallback a mock si falla (opcional, para demo)
      setTrip({
        id: tripId,
        pasajero: { nombre: 'Pasajero (Offline)', telefono: '123456789' },
        origen: { direccion: 'Origen Desconocido' },
        destino: { direccion: 'Destino Desconocido' },
        tarifa: 0
      });
      // Alert.alert('Error', 'No se pudieron cargar los detalles del viaje');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      // Llamada a API para actualizar estado
      await tripApi.updateTripStatus(tripId, newStatus);
      setStatus(newStatus);
      
      if (newStatus === TRIP_STATUSES.FINALIZADO) {
        Alert.alert('Viaje Finalizado', 'El viaje ha sido completado exitosamente.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }], // O TripRequestScreen
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del viaje');
    } finally {
      setLoading(false);
    }
  };

  const renderActionButton = () => {
    switch (status) {
      case TRIP_STATUSES.ASIGNADO:
        return (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => updateStatus(TRIP_STATUSES.EN_CAMINO)}
          >
            <Text style={styles.buttonText}>En Camino al Origen</Text>
          </TouchableOpacity>
        );
      case TRIP_STATUSES.EN_CAMINO:
        return (
          <TouchableOpacity 
            style={[styles.button, styles.warningButton]}
            onPress={() => updateStatus(TRIP_STATUSES.EN_ORIGEN)}
          >
            <Text style={styles.buttonText}>Llegué al Origen</Text>
          </TouchableOpacity>
        );
      case TRIP_STATUSES.EN_ORIGEN:
        return (
          <TouchableOpacity 
            style={[styles.button, styles.successButton]}
            onPress={() => updateStatus(TRIP_STATUSES.EN_CURSO)}
          >
            <Text style={styles.buttonText}>Iniciar Viaje</Text>
          </TouchableOpacity>
        );
      case TRIP_STATUSES.EN_CURSO:
        return (
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={() => updateStatus(TRIP_STATUSES.FINALIZADO)}
          >
            <Text style={styles.buttonText}>Finalizar Viaje</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  if (loading && !trip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Viaje en Curso</Text>
      </View>

      <View style={styles.mapContainer}>
        {/* Aquí iría el componente MapView */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color="#CBD5E1" />
          <Text style={styles.mapText}>Mapa del Recorrido</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.passengerCard}>
          <View style={styles.passengerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {trip?.pasajero?.nombre?.charAt(0) || 'P'}
              </Text>
            </View>
            <View>
              <Text style={styles.passengerName}>{trip?.pasajero?.nombre || 'Pasajero'}</Text>
              <Text style={styles.tripPrice}>${trip?.tarifa || '0.00'}</Text>
            </View>
          </View>
          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="call" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="chatbubble" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Ionicons name="radio-button-on" size={16} color="#007AFF" />
            <Text style={styles.addressText}>{trip?.origen?.direccion || 'Origen'}</Text>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routePoint}>
            <Ionicons name="location" size={16} color="#EF4444" />
            <Text style={styles.addressText}>{trip?.destino?.direccion || 'Destino'}</Text>
          </View>
        </View>

        <View style={styles.statusControls}>
            {renderActionButton()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    marginTop: 8,
    color: '#64748B',
    fontWeight: '500',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  passengerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tripPrice: {
    fontSize: 14,
    color: '#64748B',
  },
  tripActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  routeContainer: {
    marginBottom: 24,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeConnector: {
    height: 20,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: 7,
    marginVertical: 2,
  },
  addressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  statusControls: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#007AFF', // Azul
  },
  warningButton: {
    backgroundColor: '#F59E0B', // Naranja
  },
  successButton: {
    backgroundColor: '#10B981', // Verde
  },
  dangerButton: {
    backgroundColor: '#EF4444', // Rojo
  },
});
