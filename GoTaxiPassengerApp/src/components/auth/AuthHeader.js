import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AuthHeader({ eslogan = '¡Su taxi a un click de distancia!' }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.goBox}>
          <Text style={styles.goText}>Go</Text>
        </View>
        <View style={styles.taxiBox}>
          <Text style={styles.taxiText}>Taxi</Text>
        </View>
      </View>
      <Text style={styles.slogan}>{eslogan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goBox: {
    backgroundColor: '#007aff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  goText: {
    color: '#ffd600',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 2,
  },
  taxiBox: {
    backgroundColor: '#ffd600',
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  taxiText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 2,
  },
  slogan: {
    marginTop: 5,
    color: '#555',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
