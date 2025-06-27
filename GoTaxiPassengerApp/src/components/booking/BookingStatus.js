import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingStatus({ status }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Estado del Viaje:</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontWeight: 'bold' },
  status: { fontSize: 16, marginTop: 4 },
});
