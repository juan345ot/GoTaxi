import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import RatingStars from '../common/RatingStars';

export default function DriverInfoCard({ driver, vehicle }) {
  return (
    <View style={styles.card}>
      <Image
        source={driver?.avatar ? { uri: driver.avatar } : require('../../../assets/images/driver1.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{driver?.name}</Text>
        <RatingStars value={driver?.rating || 0} size={16} disabled />
        <Text style={styles.vehicle}>{vehicle}</Text>
        {driver?.carImage && (
          <Image source={{ uri: driver.carImage }} style={styles.carImage} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    padding: 9,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 1, height: 5 },
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  name: {
    color: '#007aff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  vehicle: {
    color: '#555',
    fontSize: 13,
    marginTop: 1,
  },
  carImage: {
    width: 40,
    height: 30,
    borderRadius: 5,
    marginTop: 5,
  },
});
