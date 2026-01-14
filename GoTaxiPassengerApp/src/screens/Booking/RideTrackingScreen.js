import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';
import DriverDetailsModal from '../../components/booking/DriverDetailsModal';
import SOSModal from '../../components/emergency/SOSModal';
import ShareLocationModal from '../../components/emergency/ShareLocationModal';
import { useTheme } from '../../contexts/ThemeContext';
import i18n from '../../translations';
import * as rideApi from '../../api/ride';
import { showToast } from '../../utils/toast';

export default function RideTrackingScreen({ route, navigation }) {
  // Obtener tema con validaci?n robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }

  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };

  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }

  // Garantizar que colors siempre exista
  if (!theme || !theme.colors) {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }

  // Validaci?n final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };

  const { rideId, origin: routeOrigin, destination: routeDestination } = route.params || {};
  const [ride, setRide] = useState(null);
  // Si tenemos datos de route.params, no empezar en loading
  const [loading, setLoading] = useState(!routeOrigin || !routeDestination);
  const [taxiPosition, setTaxiPosition] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [driverArrived, setDriverArrived] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const wsRef = useRef(null);

  // Datos simulados del conductor
  const mockDriver = {
    name: 'Carlos Mendoza',
    phone: '+5491123456789',
    rating: 4.5,
    vehicle: 'Hyundai Genesis',
    licensePlate: 'ABC-123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=150&fit=crop',
  };

  // 1. Polling REST cada 3 segs
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    const fetchRide = async() => {
      try {
        const response = await rideApi.getRideById(rideId);
        // El backend devuelve { success: true, data: {...} }
        const rideData = response?.data || response;
        setRide(rideData);

        if (rideData?.estado === 'completado' || rideData?.status === 'completed') {
          navigation.replace('TripSummary', {
            ...rideData,
            rideId: rideData._id || rideData.id,
          });
        }
        if (rideData?.estado === 'cancelado' || rideData?.status === 'cancelled') {
          navigation.replace('TripSummary', {
            ...rideData,
            cancelado: true,
            rideId: rideData._id || rideData.id,
          });
        }
      } catch (e) {
        console.warn('Error obteniendo viaje:', e);
        // Si hay error pero tenemos datos de route.params, usarlos
        if (routeOrigin && routeDestination) {
          setRide({
            origen: routeOrigin,
            destino: routeDestination,
            estado: 'pendiente',
            status: 'requested',
          });
        }
      } finally {
        // Si tenemos datos de route.params, no esperar a la respuesta del servidor
        if (routeOrigin && routeDestination) {
          setLoading(false);
        }
      }
    };

    // Si tenemos datos de route.params, no esperar a la respuesta del servidor
    if (routeOrigin && routeDestination) {
      setLoading(false);
      setRide({
        origen: routeOrigin,
        destino: routeDestination,
        estado: 'pendiente',
        status: 'requested',
      });
    }

    fetchRide();
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [rideId, routeOrigin, routeDestination, navigation]);

  // 2. Simulaci?n del conductor y movimiento del taxi
  useEffect(() => {
    // Usar datos del viaje o route.params
    const origenData = ride?.origen || routeOrigin;
    const destinoData = ride?.destino || routeDestination;

    if (!origenData || !destinoData) return;

    const startLat = origenData.lat || origenData.latitude;
    const startLng = origenData.lng || origenData.longitude;
    const endLat = destinoData.lat || destinoData.latitude;
    const endLng = destinoData.lng || destinoData.longitude;

    if (!startLat || !startLng || !endLat || !endLng) return;

    // Simular posici?n inicial del taxi (lejos del origen, hacia el sur-este)
    const initialTaxiLat = startLat - 0.015;
    const initialTaxiLng = startLng + 0.015;
    // Establecer posici?n inicial inmediatamente
    setTaxiPosition({ latitude: initialTaxiLat, longitude: initialTaxiLng });

    let progress = 0;
    let phase = 'coming'; // 'coming', 'waiting', 'trip'
    let intervalId = null;

    const simulateDriver = () => {
      if (phase === 'coming' && !tripStarted) {
        // El conductor viene hacia el origen - movimiento gradual
        progress += 0.003; // Incremento más pequeño para movimiento más gradual
        if (progress >= 1) {
          progress = 1;
          phase = 'waiting';
          // Driver arrived - establecer posici?n exacta en el origen
          setTaxiPosition({ latitude: startLat, longitude: startLng });
          setDriverArrived(true);
          showToast('¡El conductor llegó! ¿Te subes al taxi?');
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return;
        }

        // Interpolación desde posición inicial hasta origen - movimiento gradual
        const currentLat = initialTaxiLat + (startLat - initialTaxiLat) * progress;
        const currentLng = initialTaxiLng + (startLng - initialTaxiLng) * progress;
        setTaxiPosition({ latitude: currentLat, longitude: currentLng });
      }
    };

    // Iniciar simulación inmediatamente con un pequeño delay para asegurar que el estado se establezca
    setTimeout(() => {
      if (!tripStarted) {
        intervalId = setInterval(simulateDriver, 200); // Cada 200ms para movimiento gradual y visible
      }
    }, 500);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ride, routeOrigin, routeDestination, tripStarted]);

  // 3. Efecto para iniciar el viaje cuando el usuario confirma
  useEffect(() => {
    const origenData = ride?.origen || routeOrigin;
    const destinoData = ride?.destino || routeDestination;

    if (tripStarted && origenData && destinoData) {
      // Continuar el movimiento hacia el destino
      const startLat = origenData.lat || origenData.latitude;
      const startLng = origenData.lng || origenData.longitude;
      const endLat = destinoData.lat || destinoData.latitude;
      const endLng = destinoData.lng || destinoData.longitude;

      if (!startLat || !startLng || !endLat || !endLng) return;

      // NO resetear posición - continuar desde donde está (o desde origen si no hay posición)
      if (!taxiPosition) {
        setTaxiPosition({ latitude: startLat, longitude: startLng });
      }

      let progress = 0;
      let tripInterval = null;

      const moveToDestination = () => {
        progress += 0.003; // Movimiento gradual igual que al origen
        if (progress >= 1) {
          progress = 1;
          setTaxiPosition({ latitude: endLat, longitude: endLng });
          showToast('¡Llegamos al destino!');
          clearInterval(tripInterval);
          // Navegar a TripSummary después de llegar al destino
          setTimeout(() => {
            navigation.replace('TripSummary', {
              ...ride,
              origin: origenData?.direccion || origenData?.address || 'Origen desconocido',
              destination: destinoData?.direccion || destinoData?.address || 'Destino desconocido',
              distance: ride?.distancia || ride?.distance || 0,
              duration: ride?.duracion || ride?.duration || 0,
              total: ride?.total || ride?.fare || 0,
              cancelado: false,
              paymentMethod: ride?.paymentMethod || 'cash',
              rideId: ride?._id || ride?.id || rideId,
            });
          }, 1500);
          return;
        }

        // Interpolación desde origen hasta destino - movimiento gradual
        const currentLat = startLat + (endLat - startLat) * progress;
        const currentLng = startLng + (endLng - startLng) * progress;
        setTaxiPosition({ latitude: currentLat, longitude: currentLng });
      };

      tripInterval = setInterval(moveToDestination, 200); // Mismo intervalo que al origen
      return () => {
        if (tripInterval) {
          clearInterval(tripInterval);
        }
      };
    }
  }, [tripStarted, ride, routeOrigin, routeDestination, navigation, taxiPosition]);

  // Funci?n para confirmar que el pasajero se sube al taxi
  const handleConfirmBoarding = () => {
    setDriverArrived(false);
    setTripStarted(true);
    showToast('?Viaje iniciado!');
  };

  // 2. WebSocket para actualizaciones instant?neas (opcional)
  // Si quer?s, pod?s sumar esto despu?s usando el socketURL del backend

  // Mostrar el mapa incluso si no hay ride pero tenemos datos de route.params
  const hasRouteData = routeOrigin && routeDestination;
  // Solo mostrar loading si no tenemos datos de route.params y estamos cargando
  if (loading && !hasRouteData) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />;
  }

  // Mapear la info para el mapa y la UI con valores por defecto
  const {
    origen = null,
    destino = null,
    estado = 'pendiente',
    status = 'requested',
  } = ride || {};

  // Usar datos simulados del conductor
  const driver = mockDriver;
  const vehicle = `${mockDriver.vehicle} - ${mockDriver.licensePlate}`;

  // Convertir origen/destino a formato de coordenadas para el mapa
  // Priorizar datos del viaje, luego route.params, luego null
  const origin = useMemo(() => {
    if (origen?.lat && origen?.lng) {
      return { latitude: origen.lat, longitude: origen.lng };
    } else if (routeOrigin?.latitude && routeOrigin?.longitude) {
      return routeOrigin;
    } else if (routeOrigin?.lat && routeOrigin?.lng) {
      return { latitude: routeOrigin.lat, longitude: routeOrigin.lng };
    }
    return null;
  }, [origen?.lat, origen?.lng, routeOrigin]);

  const destination = useMemo(() => {
    if (destino?.lat && destino?.lng) {
      return { latitude: destino.lat, longitude: destino.lng };
    } else if (routeDestination?.latitude && routeDestination?.longitude) {
      return routeDestination;
    } else if (routeDestination?.lat && routeDestination?.lng) {
      return { latitude: routeDestination.lat, longitude: routeDestination.lng };
    }
    return null;
  }, [destino?.lat, destino?.lng, routeDestination]);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/da83e2ab-d905-4a54-848c-0ddd20d20950', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'RideTrackingScreen.js:242', message: 'RideTrackingScreen rendering', data: { hasSafeAreaView: false, usesView: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => {});
  }, []);
  // #endregion

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <TaxiMap
        origin={origin}
        destination={destination}
        taxiPosition={taxiPosition}
        showTaxi={true}
        onPressSOS={() => setShowSOSModal(true)}
        onPressShare={() => setShowShareModal(true)}
        onPressChat={() => navigation.navigate('Chat', { rideId })}
        onPressCall={() => {
          const phoneNumber = `tel:${mockDriver.phone}`;
          Linking.canOpenURL(phoneNumber)
            .then((supported) => {
              if (supported) {
                Linking.openURL(phoneNumber);
              } else {
                showToast('No se puede realizar la llamada');
              }
            })
            .catch(() => showToast('Error al abrir el marcador'));
        }}
        chatEnabled={true}
        callEnabled={true}
      />
      <View style={styles.infoBox}>
        <DriverInfoCard
          driver={driver}
          vehicle={vehicle}
          onPress={() => setShowDriverDetails(true)}
        />
        <Text style={[styles.estado, { color: safeTheme.colors.text }]}>
          {driverArrived && '¡El conductor llegó! ¿Te subes al taxi?'}
          {!driverArrived && !tripStarted && i18n.t('taxi_on_the_way')}
          {tripStarted && i18n.t('trip_in_progress')}
          {status === 'completed' && i18n.t('trip_arrived_title')}
          {status === 'cancelled' && i18n.t('trip_cancelled_title')}
        </Text>
      </View>
      {/* Bot?n de confirmaci?n de subida al taxi */}
      {driverArrived && (
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: '#4CAF50' }]}
          onPress={handleConfirmBoarding}
        >
          <Text style={styles.confirmBtnText}>Sí, me subo al taxi</Text>
        </TouchableOpacity>
      )}
      {/* Debug info */}
      {__DEV__ && (
        <Text style={[styles.debugText, { color: safeTheme.colors.textSecondary }]}>
          Debug: driverArrived={driverArrived.toString()}, tripStarted={tripStarted.toString()}, taxiPosition={taxiPosition ? `${taxiPosition.latitude.toFixed(4)}, ${taxiPosition.longitude.toFixed(4)}` : 'null'}, showTaxi=true
        </Text>
      )}

      {/* Bot?n de cancelar viaje */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          Alert.alert(
            i18n.t('cancel_trip_btn'),
            i18n.t('cancel_warning_dialog', { fine: 500 }),
            [
              { text: i18n.t('no'), style: 'cancel' },
              {
                text: i18n.t('yes_cancel'),
                style: 'destructive',
                onPress: async() => {
                  await rideApi.cancelRide(rideId);
                  const origenData = ride?.origen || routeOrigin;
                  const destinoData = ride?.destino || routeDestination;
                  navigation.replace('TripSummary', {
                    ...ride,
                    origin: origenData?.direccion || origenData?.address || 'Origen desconocido',
                    destination: destinoData?.direccion || destinoData?.address || 'Destino desconocido',
                    distance: ride?.distancia || ride?.distance || 0,
                    duration: ride?.duracion || ride?.duration || 0,
                    total: 0,
                    cancelado: true,
                    multa: 500, // Multa por cancelación
                    paymentMethod: ride?.paymentMethod || 'cash',
                    rideId: ride?._id || ride?.id || rideId,
                  });
                },
              },
            ],
          );
        }}
      >
        <Text style={styles.cancelBtnText}>{i18n.t('cancel_trip_btn')}</Text>
      </TouchableOpacity>

      {/* Modales */}
      <SOSModal
        visible={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />

      <ShareLocationModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        location={origin ? `${origin.latitude}, ${origin.longitude}` : 'Ubicaci?n no disponible'}
      />

      {/* Modal de detalles del conductor */}
      {showDriverDetails && (
        <DriverDetailsModal
          visible={showDriverDetails}
          driver={driver}
          vehicle={vehicle}
          onClose={() => setShowDriverDetails(false)}
          onCall={() => {
            const phoneNumber = `tel:${mockDriver.phone}`;
            Linking.canOpenURL(phoneNumber)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(phoneNumber);
                } else {
                  showToast('No se puede realizar la llamada');
                }
              })
              .catch(() => showToast('Error al abrir el marcador'));
            setShowDriverDetails(false);
          }}
          onChat={() => {
            setShowDriverDetails(false);
            navigation.navigate('Chat', { rideId });
          }}
          theme={safeTheme}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBox: {
    padding: 10,
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estado: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  confirmBtn: {
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 34,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  cancelBtn: {
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 34,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 13,
    borderWidth: 1,
    minHeight: 48,
  },
  cancelBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
