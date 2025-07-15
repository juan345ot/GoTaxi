import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, Text } from 'react-native';

export default function GoTaxiMap({ region, marker }) {
  return (
    <View style={{ flex: 1, height: 200, borderRadius: 12, overflow: 'hidden', marginVertical: 10 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {marker && (
          <Marker coordinate={marker} title="Destino" />
        )}
      </MapView>
    </View>
  );
}
