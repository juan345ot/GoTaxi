import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiMap({
  origin,
  destination,
  taxiPosition,
  showTaxi = true,
  onPressSOS,
  onPressShare,
  onPressChat,
  onPressCall,
  chatEnabled = false,
  callEnabled = false,
}) {
  const mapRef = useRef(null);

  // Foco automático
  useEffect(() => {
    if (mapRef.current && origin && destination && origin.latitude && origin.longitude && destination.latitude && destination.longitude) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
        animated: true,
      });
    }
  }, [origin, destination]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={origin ? {
          ...origin,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        } : {
          latitude: -34.6037,
          longitude: -58.3816,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        showsUserLocation
        loadingEnabled
      >
        {origin && origin.latitude && origin.longitude && (
          <Marker coordinate={origin} title="Origen">
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="location" size={32} color="#007aff" />
              <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 12 }}>ORIGEN</Text>
            </View>
          </Marker>
        )}
        {destination && destination.latitude && destination.longitude && (
          <Marker coordinate={destination} title="Destino">
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="flag" size={32} color="#ff6b35" />
              <Text style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: 12 }}>DESTINO</Text>
            </View>
          </Marker>
        )}
        {origin && destination && origin.latitude && origin.longitude && destination.latitude && destination.longitude && (
          <Polyline
            coordinates={[
              origin,
              {
                latitude: (origin.latitude + destination.latitude) / 2 + 0.002,
                longitude: (origin.longitude + destination.longitude) / 2 + 0.001
              },
              {
                latitude: (origin.latitude + destination.latitude) / 2 - 0.001,
                longitude: (origin.longitude + destination.longitude) / 2 + 0.003
              },
              destination
            ]}
            strokeColor="#007aff"
            strokeWidth={4}
            strokePattern={[5, 5]}
          />
        )}
        {showTaxi && taxiPosition && (
          <Marker coordinate={taxiPosition} title="Taxi en camino">
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="taxi" size={40} color="#00C851" />
              <Text style={{ color: '#00C851', fontWeight: 'bold', fontSize: 10 }}>TAXI</Text>
            </View>
          </Marker>
        )}
      </MapView>
      {/* Botones flotantes */}
      <View style={styles.floatBtns}>
        <TouchableOpacity style={styles.sosBtn} onPress={onPressSOS}>
          <Ionicons name="alert" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={onPressShare}>
          <Ionicons name="share-social" size={25} color="#007aff" />
        </TouchableOpacity>
        {chatEnabled && (
          <TouchableOpacity style={styles.chatBtn} onPress={onPressChat}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {callEnabled && (
          <TouchableOpacity style={styles.callBtn} onPress={onPressCall}>
            <Ionicons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 14,
    minHeight: 280,
    maxHeight: 400,
    marginBottom: 12,
  },
  floatBtns: {
    position: 'absolute',
    right: 16,
    top: 28,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 99,
  },
  sosBtn: {
    backgroundColor: '#e53935',
    borderRadius: 50,
    padding: 11,
    marginBottom: 3,
    elevation: 6,
    shadowColor: '#222',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 5 },
  },
  shareBtn: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#007aff',
    marginBottom: 2,
  },
  chatBtn: {
    backgroundColor: '#007aff',
    borderRadius: 50,
    padding: 10,
    marginBottom: 2,
  },
  callBtn: {
    backgroundColor: '#00c853',
    borderRadius: 50,
    padding: 10,
  },
});
