import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../common/RatingStars';

// Solo habilitar LayoutAnimation en Android y si no es la Nueva Arquitectura
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !globalThis.__turboModuleProxy) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TripItem = memo(function TripItem({ trip }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  // Memoizar valores computados
  const formattedDate = useMemo(() => {
    return new Date(trip.fecha || trip.date).toLocaleString();
  }, [trip.fecha, trip.date]);

  const paymentMethodText = useMemo(() => {
    switch (trip.metodoPago) {
      case 'cash':
        return 'Efectivo';
      case 'mp':
        return 'Mercado Pago';
      default:
        return 'Tarjeta';
    }
  }, [trip.metodoPago]);

  const tripDetails = useMemo(() => {
    return {
      driver: trip.driver || 'N/A',
      vehicle: trip.vehicle || 'N/A',
      distance: trip.distancia ? `${trip.distancia} m` : 'N/A',
      duration: trip.duration ? `${trip.duration} min` : 'N/A',
      pin: trip.pin || 'N/A',
      rating: trip.rating || 0,
      hasComment: !!trip.comment,
    };
  }, [trip.driver, trip.vehicle, trip.distancia, trip.duration, trip.pin, trip.rating, trip.comment]);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.row} onPress={handleExpand} activeOpacity={0.75}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{trip.origin} ➔ {trip.destination}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.importe}>${trip.importe} — <Text style={styles.metodo}>
            {paymentMethodText}
          </Text></Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={24}
          color="#007aff"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Conductor:</Text>
          <Text style={styles.detailValue}>{tripDetails.driver}</Text>
          <Text style={styles.detailLabel}>Vehículo:</Text>
          <Text style={styles.detailValue}>{tripDetails.vehicle}</Text>
          <Text style={styles.detailLabel}>Distancia recorrida:</Text>
          <Text style={styles.detailValue}>{tripDetails.distance}</Text>
          <Text style={styles.detailLabel}>Duración:</Text>
          <Text style={styles.detailValue}>{tripDetails.duration}</Text>
          <Text style={styles.detailLabel}>PIN de pago:</Text>
          <Text style={styles.detailValue}>{tripDetails.pin}</Text>
          <Text style={styles.detailLabel}>Calificación:</Text>
          <RatingStars value={tripDetails.rating} size={17} disabled />
          {tripDetails.hasComment && (
            <>
              <Text style={styles.detailLabel}>Comentario:</Text>
              <Text style={styles.comentario}>{trip.comment}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 9,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#333',
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1b1b1b',
  },
  date: {
    color: '#888',
    fontSize: 13,
  },
  importe: {
    color: '#007aff',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 2,
  },
  metodo: {
    color: '#222',
    fontWeight: '400',
    fontSize: 14,
  },
  details: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    gap: 2,
  },
  detailLabel: {
    color: '#007aff',
    fontWeight: '600',
    fontSize: 13,
  },
  detailValue: {
    color: '#222',
    marginBottom: 4,
    fontSize: 13,
  },
  comentario: {
    color: '#444',
    fontStyle: 'italic',
    backgroundColor: '#f4faff',
    borderRadius: 5,
    padding: 5,
    marginTop: 2,
    marginBottom: 6,
  },
});

export default TripItem;
