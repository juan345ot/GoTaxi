import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AuthHeader({ eslogan = '¡Conduce con GoTaxi y ganá más viajes!' }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.goBox}>
          <Text style={styles.goText}>Go</Text>
        </View>
        <View style={styles.taxiBox}>
          <Text style={styles.taxiText}>Taxi</Text>
        </View>
        <View style={styles.driverBox}>
          <Text style={styles.driverText}>Driver</Text>
        </View>
      </View>
      <Text style={styles.slogan}>{eslogan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 14, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  goBox: { backgroundColor: '#ffd600', paddingVertical: 8, paddingHorizontal: 20, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  goText: { color: '#007aff', fontSize: 36, fontWeight: 'bold', letterSpacing: 2 },
  taxiBox: { backgroundColor: '#ffd600', paddingVertical: 8, paddingHorizontal: 26 },
  taxiText: { color: '#007aff', fontSize: 36, fontWeight: 'bold', letterSpacing: 2 },
  driverBox: { backgroundColor: '#ffd600', paddingVertical: 8, paddingHorizontal: 22, borderTopRightRadius: 18, borderBottomRightRadius: 18, marginLeft: -4 },
  driverText: { color: '#007aff', fontSize: 36, fontWeight: 'bold', letterSpacing: 2 },
  slogan: { marginTop: 5, fontSize: 16, fontStyle: 'italic', fontWeight: '600', color: '#555', textAlign: 'center' },
});
