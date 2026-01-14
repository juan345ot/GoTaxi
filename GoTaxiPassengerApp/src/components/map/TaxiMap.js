import React, { useEffect, useRef, memo, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import RouteService from '../../services/RouteService';

const TaxiMap = memo(function TaxiMap({
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
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Obtener ruta real cuando cambian origen o destino (solo una vez)
  const routeFetched = useRef(false);
  useEffect(() => {
    if (routeFetched.current) return; // Solo obtener la ruta una vez

    const fetchRoute = async() => {
      if (origin?.latitude && origin?.longitude && destination?.latitude && destination?.longitude) {
        try {
          const route = await RouteService.getRoute(origin, destination);
          if (route && Array.isArray(route) && route.length > 0) {
            setRouteCoordinates(route);
          } else {
            // Fallback a línea recta si la ruta está vacía
            setRouteCoordinates([origin, destination]);
          }
        } catch (error) {
          console.warn('Error obteniendo ruta:', error);
          // Fallback a línea recta
          setRouteCoordinates([origin, destination]);
        }
        routeFetched.current = true;
      } else {
        setRouteCoordinates([]);
      }
    };
    fetchRoute();
  }, [origin, destination]);

  // Memoizar callbacks para evitar re-renders innecesarios
  const handleSOS = useCallback(() => {
    onPressSOS?.();
  }, [onPressSOS]);

  const handleShare = useCallback(() => {
    onPressShare?.();
  }, [onPressShare]);

  const handleChat = useCallback(() => {
    onPressChat?.();
  }, [onPressChat]);

  const handleCall = useCallback(() => {
    onPressCall?.();
  }, [onPressCall]);

  // Memoizar región inicial
  const initialRegion = useMemo(() => {
    if (origin?.latitude && origin?.longitude) {
      return {
        ...origin,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      };
    }
    return {
      latitude: -34.6037,
      longitude: -58.3816,
      latitudeDelta: 0.009,
      longitudeDelta: 0.009,
    };
  }, [origin]);

  // Usar las coordenadas de la ruta obtenida
  const polylineCoordinates = useMemo(() => {
    if (routeCoordinates.length > 0) {
      return routeCoordinates;
    }
    // Fallback si no hay ruta aún
    if (origin?.latitude && origin?.longitude && destination?.latitude && destination?.longitude) {
      return [origin, destination];
    }
    return [];
  }, [routeCoordinates, origin, destination]);

  // Memoizar validaciones de coordenadas
  const hasValidOrigin = useMemo(() => {
    return origin?.latitude && origin?.longitude;
  }, [origin]);

  const hasValidDestination = useMemo(() => {
    return destination?.latitude && destination?.longitude;
  }, [destination]);

  // Ref para trackear el estado anterior y evitar logs excesivos
  const prevValidState = useRef(null);

  const hasValidTaxiPosition = useMemo(() => {
    const isValid = showTaxi && taxiPosition?.latitude && taxiPosition?.longitude && !isNaN(taxiPosition.latitude) && !isNaN(taxiPosition.longitude);
    // Log reducido solo cuando cambia el estado de validez o cuando es null inicialmente
    if (__DEV__ && (prevValidState.current === null || prevValidState.current !== isValid)) {
      console.log('TaxiMap - hasValidTaxiPosition:', { isValid, hasPosition: !!taxiPosition });
      prevValidState.current = isValid;
    }
    return isValid;
  }, [taxiPosition, showTaxi]);

  // AUTO-ZOOM COMPLETAMENTE DESHABILITADO - El usuario controla el mapa manualmente desde el inicio
  const mapReadyRef = useRef(false);

  // NO HACER AUTO-ZOOM - El usuario tiene control total desde el inicio
  // Esto permite zoom y desplazamiento manual sin interferencias

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        loadingEnabled={false}
        mapType="standard"
        zoomEnabled={true}
        zoomControlEnabled={Platform.OS === 'android'}
        scrollEnabled={true}
        moveOnMarkerPress={false}
        minZoomLevel={1}
        maxZoomLevel={20}
        zoomTapEnabled={true}
        onMapReady={() => {
          // Mapa listo - marcar como listo para permitir el primer fitToCoordinates
          mapReadyRef.current = true;
        }}
        pitchEnabled={false}
        rotateEnabled={false}
        cacheEnabled={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPanDrag={() => {
          // Usuario arrastrando - el mapa está bajo control manual
        }}
        onPress={() => {
          // Usuario tocando - el mapa está bajo control manual
        }}
        onPoiClick={() => {
          // Usuario clickeando POI - el mapa está bajo control manual
        }}
        onRegionChangeComplete={(region) => {
          // Permitir que el usuario controle la región libremente
        }}
        onMarkerPress={() => {
          // No hacer nada, solo evitar que el marker mueva el mapa
        }}
      >
        {hasValidOrigin && (
          <Marker coordinate={origin} title="Origen" anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.originMarker}>
              <Ionicons name="location" size={20} color="#007AFF" />
            </View>
          </Marker>
        )}
        {hasValidDestination && (
          <Marker coordinate={destination} title="Destino" anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.destinationMarker}>
              <Ionicons name="flag" size={20} color="#FF6B35" />
            </View>
          </Marker>
        )}
        {polylineCoordinates.length > 0 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
        {showTaxi && hasValidTaxiPosition && taxiPosition && (
          <Marker
            key="taxi-marker"
            coordinate={taxiPosition}
            title="Taxi en camino"
            description="El taxi se está acercando"
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            zIndex={1000}
            flat={false}
            identifier="taxi-marker"
          >
            <View style={styles.taxiMarker} collapsable={false} pointerEvents="none">
              <Ionicons name="car" size={18} color="#00C851" />
            </View>
          </Marker>
        )}
      </MapView>
      {/* Botones flotantes */}
      <View style={styles.floatBtns}>
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Ionicons name="alert" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={25} color="#007aff" />
        </TouchableOpacity>
        {chatEnabled && (
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {callEnabled && (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 14,
    minHeight: 350,
    maxHeight: 500,
    marginBottom: 0,
  },
  originMarker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  destinationMarker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FF6B35',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  taxiMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 2,
    borderColor: '#00C851',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  floatBtns: {
    position: 'absolute',
    right: 16,
    top: 28,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 99,
    pointerEvents: 'box-none', // Permitir que los gestos pasen a través del contenedor
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

export default TaxiMap;
