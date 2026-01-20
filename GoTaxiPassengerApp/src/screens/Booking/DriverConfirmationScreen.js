import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/common/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as rideApi from '../../api/ride';

export default function DriverConfirmationScreen({ route, navigation }) {
  const { rideId, driver, origin, destination } = route.params || {};
  const [waiting, setWaiting] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

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
    warning: '#F59E0B',
  };

  const safeTheme = themeContext?.theme?.colors || defaultColors;

  useEffect(() => {
    // Polling para verificar estado del viaje
    pollIntervalRef.current = setInterval(checkTripStatus, 3000);

    // Timeout de 2 minutos
    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      setTimedOut(true);
      showToast('El conductor no respondió a tiempo');
      clearInterval(pollIntervalRef.current);
    }, 120000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const checkTripStatus = async () => {
    try {
      const trip = await rideApi.getRideById(rideId);
      
      // Si el conductor confirmó
      if (trip.estado === 'asignado' || trip.status === 'accepted') {
        clearInterval(pollIntervalRef.current);
        clearTimeout(timeoutRef.current);
        showToast('¡Conductor confirmado!');
        navigation.replace('RideTracking', {
          rideId,
          origin,
          destination,
          ...trip,
        });
      }
      
      // Si el conductor rechazó
      if (trip.estado === 'pendiente' && trip.conductor === null) {
        clearInterval(pollIntervalRef.current);
        clearTimeout(timeoutRef.current);
        showToast('El conductor rechazó el viaje');
        navigation.replace('DriverSelection', {
          rideId,
          origin,
          destination,
        });
      }
    } catch (error) {
      console.error('Error verificando estado del viaje:', error);
    }
  };

  const handleCancel = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    navigation.replace('DriverSelection', {
      rideId,
      origin,
      destination,
    });
  };

  const handleRetry = () => {
    navigation.replace('DriverSelection', {
      rideId,
      origin,
      destination,
    });
  };

  const driverName = driver?.user
    ? `${driver.user.nombre} ${driver.user.apellido}`
    : 'Conductor';
  const vehiculo = driver?.vehiculo || {};

  if (timedOut) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.background }]}>
        <AppHeader showBackButton={false} />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={80} color={safeTheme.warning} />
          </View>
          <Text style={[styles.title, { color: safeTheme.text }]}>
            Tiempo de espera agotado
          </Text>
          <Text style={[styles.message, { color: safeTheme.textSecondary }]}>
            El conductor no respondió a tiempo. Podés seleccionar otro conductor.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: safeTheme.primary }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Seleccionar otro conductor</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.background }]}>
      <AppHeader showBackButton={false} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color={safeTheme.primary} />
        </View>
        
        <Text style={[styles.title, { color: safeTheme.text }]}>
          Esperando confirmación del conductor
        </Text>
        
        <View style={[styles.driverCard, { backgroundColor: safeTheme.surface, borderColor: safeTheme.border }]}>
          <Text style={[styles.driverName, { color: safeTheme.text }]}>
            {driverName}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFA500" />
            <Text style={[styles.rating, { color: safeTheme.textSecondary }]}>
              {driver?.calificacion?.toFixed(1) || '5.0'}
            </Text>
          </View>
          <Text style={[styles.vehicle, { color: safeTheme.textSecondary }]}>
            {vehiculo.marca} {vehiculo.modelo} • {vehiculo.color}
          </Text>
          <Text style={[styles.plate, { color: safeTheme.textSecondary }]}>
            {vehiculo.patente || 'N/A'}
          </Text>
        </View>

        <Text style={[styles.waitingText, { color: safeTheme.textSecondary }]}>
          El conductor tiene 2 minutos para confirmar el viaje...
        </Text>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: safeTheme.border }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelButtonText, { color: safeTheme.text }]}>
            Cancelar y elegir otro conductor
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  driverCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
  },
  vehicle: {
    fontSize: 16,
    marginBottom: 4,
  },
  plate: {
    fontSize: 14,
    fontWeight: '500',
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
