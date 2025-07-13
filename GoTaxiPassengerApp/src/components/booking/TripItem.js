import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../common/RatingStars';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TripItem({ trip }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.row} onPress={handleExpand} activeOpacity={0.75}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{trip.origin} ➔ {trip.destination}</Text>
          <Text style={styles.date}>{new Date(trip.date).toLocaleString()}</Text>
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
          <Text style={styles.detailValue}>{trip.driver || 'N/A'}</Text>
          <Text style={styles.detailLabel}>Vehículo:</Text>
          <Text style={styles.detailValue}>{trip.vehicle || 'N/A'}</Text>
          <Text style={styles.detailLabel}>Método de pago:</Text>
          <Text style={styles.detailValue}>
            {trip.paymentMethod === 'cash'
              ? 'Efectivo'
              : trip.paymentMethod === 'mp'
              ? 'Mercado Pago'
              : 'Tarjeta'}
          </Text>
          <Text style={styles.detailLabel}>Estado:</Text>
          <Text style={styles.detailValue}>{trip.status}</Text>
          <Text style={styles.detailLabel}>Calificación:</Text>
          <RatingStars value={trip.rating || 0} size={17} disabled />
          {/* Agrega más detalles si querés */}
        </View>
      )}
    </View>
  );
}

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
});
