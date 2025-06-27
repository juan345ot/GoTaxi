import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatDate';
import { colors } from '../../styles/theme';

export default function TripItem({ trip }) {
  return (
    <View style={styles.container}>
      <Ionicons name="location" size={20} color={colors.primary} />
      <View style={styles.details}>
        <Text style={styles.date}>{formatDate(trip.date)}</Text>
        <Text style={styles.route}>
          {trip.origin} → {trip.destination}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
    elevation: 1,
  },
  details: {
    marginLeft: 10,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  route: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
