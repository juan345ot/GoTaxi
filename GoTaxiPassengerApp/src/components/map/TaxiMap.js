import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
    if (mapRef.current && origin && destination) {
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
        initialRegion={{
          ...origin,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        showsUserLocation
        loadingEnabled
      >
        {origin && (
          <Marker coordinate={origin} title="Partida">
            <Ionicons name="pin" size={32} color="#007aff" />
          </Marker>
        )}
        {destination && (
          <Marker coordinate={destination} title="Destino">
            <Ionicons name="flag-outline" size={32} color="#ffd600" />
          </Marker>
        )}
        {origin && destination && (
          <Polyline
            coordinates={[origin, destination]}
            strokeColor="#007aff"
            strokeWidth={4}
          />
        )}
        {showTaxi && taxiPosition && (
          <Marker coordinate={taxiPosition} title="Taxi">
            <MaterialCommunityIcons name="taxi" size={36} color="#222" />
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
