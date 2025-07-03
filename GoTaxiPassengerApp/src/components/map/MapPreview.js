import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapPreview({ region, markers = [], onPressMarker }) { // ✅ Nueva prop agregada
  if (!region) {
    return (
      <View style={[styles.map, styles.placeholder]}>
        <Text style={styles.placeholderText}>Mapa no disponible</Text>
      </View>
    );
  }

  return (
    <MapView style={styles.map} region={region} showsUserLocation>
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          onPress={() => onPressMarker && onPressMarker(marker)} // ✅ aplicado aquí
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },
});
