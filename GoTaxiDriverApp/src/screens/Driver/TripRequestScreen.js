import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, ActivityIndicator } from 'react-native';
import TripRequestCard from '../../components/Driver/TripRequestCard';
import { useTripNotifications } from '../../hooks/useTripNotifications';
import * as tripApi from '../../api/tripApi';
import { useNavigation } from '@react-navigation/native';

export default function TripRequestScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { incomingTrip, clearNotification } = useTripNotifications();
  const navigation = useNavigation();

  // Cargar solicitudes pendientes al iniciar
  useEffect(() => {
    loadPendingRequests();
  }, []);

  // Escuchar nuevas solicitudes vía WebSocket
  useEffect(() => {
    if (incomingTrip) {
      // Verificar si ya existe para evitar duplicados
      setRequests(prev => {
        const exists = prev.find(r => r.id === incomingTrip.tripId);
        if (exists) return prev;
        
        // Formatear datos para el componente TripRequestCard
        const newRequest = {
          id: incomingTrip.tripId,
          origen: incomingTrip.origen?.direccion || 'Ubicación desconocida',
          destino: incomingTrip.destino?.direccion || 'Destino desconocido',
          pasajero: 'Pasajero', // El nombre podría venir en el socket o requerir fetch adicional
          rating: 5.0, // Default o fetch adicional
          monto: incomingTrip.tarifa || 0,
          distancia: incomingTrip.distancia_km,
        };
        
        return [newRequest, ...prev];
      });
      clearNotification();
    }
  }, [incomingTrip]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getTripRequests();
      // Mapear datos del backend al formato de UI
      const formatted = data.map(trip => ({
        id: trip._id || trip.id,
        origen: trip.origen?.direccion,
        destino: trip.destino?.direccion,
        pasajero: trip.pasajero?.nombre || 'Pasajero',
        rating: trip.pasajero?.calificacion || 5.0,
        monto: trip.tarifa,
      }));
      setRequests(formatted);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setLoading(true);
      await tripApi.acceptTrip(id);
      Alert.alert('¡Viaje aceptado!', 'Navegando al mapa...');
      
      // Eliminar de la lista local
      setRequests(requests.filter(req => req.id !== id));
      
      // Navegar a pantalla de viaje activo
      navigation.navigate('ActiveTripScreen', { tripId: id });
    } catch (error) {
      console.error('Error aceptando viaje:', error);
      Alert.alert('Error', 'No se pudo aceptar el viaje. Quizás ya fue tomado.');
      // Refrescar lista por si acaso
      loadPendingRequests();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      await tripApi.rejectTrip(id);
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error rechazando viaje:', error);
      Alert.alert('Error', 'No se pudo rechazar el viaje');
    }
  };

  if (loading && requests.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 14 }}>
      {requests.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
            No hay solicitudes pendientes.
          </Text>
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 10, fontSize: 14 }}>
            Esperando nuevos viajes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            <TripRequestCard
              trip={item}
              onAccept={() => handleAccept(item.id)}
              onReject={() => handleReject(item.id)}
            />
          }
          refreshing={loading}
          onRefresh={loadPendingRequests}
        />
      )}
    </View>
  );
}
