import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AppHeader from '../../components/common/AppHeader';
import { useTheme } from '../../contexts/ThemeContext';

import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import ProfileMenu from '../../components/common/ProfileMenu';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import useAuth from '../../hooks/useAuth';
import useRide from '../../hooks/useRide';
import { useLocationContext } from '../../contexts/LocationContext';
import { showToast } from '../../utils/toast';
import { ROUTES } from '../../navigation/routes';
import avatarImg from '../../../assets/images/avatar-default.png';
import * as addressApi from '../../api/user';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Obtener tema con validación robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }
  
  // Asegurar que theme y safeTheme.colors existan siempre - VALIDACIÓN INMEDIATA
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
    theme = {
      isDarkMode: false,
      colors: { ...defaultColors },
    };
  }
  
  // Garantizar que colors siempre exista y tenga todas las propiedades
  if (!theme || !theme.colors) {
    theme = {
      isDarkMode: false,
      colors: { ...defaultColors },
    };
  } else {
    // Asegurar que todos los colores estén presentes
    theme.colors = {
      ...defaultColors,
      ...theme.colors,
    };
  }
  
  const { requestRide, loading } = useRide();

  // Obtener contexto de ubicación
  const locationContext = useLocationContext();
  const userLocation = locationContext?.location || null;
  const reloadLocation = locationContext?.reloadLocation || (() => {});

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showDestinationAddressSelector, setShowDestinationAddressSelector] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [destinationPin, setDestinationPin] = useState(null);
  const [showPinConfirmation, setShowPinConfirmation] = useState(false);
  const [pinAddress, setPinAddress] = useState('');
  const [destinationPinCoords, setDestinationPinCoords] = useState(null);
  const originTimeoutRef = useRef(null);
  const destinationTimeoutRef = useRef(null);

  // Cargar direcciones guardadas
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addresses = await addressApi.getAddresses();
        const addressesData = addresses?.data || (Array.isArray(addresses) ? addresses : []);
        setSavedAddresses(Array.isArray(addressesData) ? addressesData : []);
      } catch (error) {
        console.warn('Error cargando direcciones:', error);
        setSavedAddresses([]);
      }
    };
    loadAddresses();
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
    };
  }, []);

  // Configurar región del mapa basada en la ubicación del usuario
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      // Si no hay origen, usar la ubicación actual
      if (!origin) {
        setOrigin('Mi ubicación actual');
      }
    }
  }, [userLocation]);

  // Obtener dirección desde coordenadas (geocodificación inversa)
  // Busca la calle más cercana si no hay una dirección exacta
  const getAddressFromLocation = useCallback(async(latitude, longitude) => {
    try {
      // Primero intentar obtener la dirección exacta
      let addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (addresses && addresses.length > 0) {
        // Buscar la primera dirección que tenga calle
        let addrWithStreet = addresses.find(addr => addr.street);
        
        if (addrWithStreet) {
          const street = addrWithStreet.street || '';
          const streetNumber = addrWithStreet.streetNumber || '';
          const city = addrWithStreet.city || '';
          const district = addrWithStreet.district || addrWithStreet.subregion || '';
          
          if (street) {
            return `${street}${streetNumber ? ' ' + streetNumber : ''}${city ? ', ' + city : ''}${district && district !== city ? ', ' + district : ''}`.trim();
          }
        }
        
        // Si no hay calle en la dirección exacta, buscar en un radio cercano
        // Buscar en puntos cercanos (aproximadamente 50-100 metros en diferentes direcciones)
        const searchRadius = 0.0005; // Aproximadamente 50 metros
        const searchPoints = [
          { lat: latitude + searchRadius, lon: longitude }, // Norte
          { lat: latitude - searchRadius, lon: longitude }, // Sur
          { lat: latitude, lon: longitude + searchRadius }, // Este
          { lat: latitude, lon: longitude - searchRadius }, // Oeste
          { lat: latitude + searchRadius * 0.7, lon: longitude + searchRadius * 0.7 }, // Noreste
          { lat: latitude - searchRadius * 0.7, lon: longitude - searchRadius * 0.7 }, // Suroeste
        ];
        
        for (const point of searchPoints) {
          try {
            const nearbyAddresses = await Location.reverseGeocodeAsync({ 
              latitude: point.lat, 
              longitude: point.lon 
            });
            
            if (nearbyAddresses && nearbyAddresses.length > 0) {
              const nearbyAddr = nearbyAddresses.find(addr => addr.street);
              if (nearbyAddr && nearbyAddr.street) {
                const street = nearbyAddr.street || '';
                const streetNumber = nearbyAddr.streetNumber || '';
                const city = nearbyAddr.city || '';
                const district = nearbyAddr.district || nearbyAddr.subregion || '';
                
                // Indicar que es una calle cercana
                return `${street}${streetNumber ? ' ' + streetNumber : ''}${city ? ', ' + city : ''}${district && district !== city ? ', ' + district : ''}`.trim();
              }
            }
          } catch (err) {
            // Continuar buscando en otros puntos
            continue;
          }
        }
        
        // Si aún no hay calle, usar la información disponible
        const addr = addresses[0];
        const city = addr.city || '';
        const district = addr.district || addr.subregion || '';
        const region = addr.region || '';
        
        if (city || district || region) {
          return `${city || district || region}`;
        }
      }
    } catch (error) {
      console.warn('Error obteniendo dirección:', error);
    }
    return null;
  }, []);

  // Actualizar origen cuando cambia la ubicación
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude && !origin) {
      getAddressFromLocation(userLocation.latitude, userLocation.longitude).then((address) => {
        if (address) {
          setOrigin(address);
        } else {
          setOrigin('Mi ubicación actual');
        }
      });
    }
  }, [userLocation, origin, getAddressFromLocation]);

  const handleRequestRide = useCallback(() => {
    if (!origin || !destination) {
      showToast('Por favor completá origen y destino');
      return;
    }
    setShowModal(true);
  }, [origin, destination]);

  const handleConfirm = useCallback(async() => {
    setShowModal(false);
    try {
      // Convertir direcciones a coordenadas si es necesario
      let originCoords = userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      } : null;
      let originAddress = origin;

      let destinationCoords = null;
      let destinationAddress = destination;

      // Si el origen no es "Mi ubicación actual", intentar geocodificar
      if (origin !== 'Mi ubicación actual' && origin) {
        try {
          // Intentar con la dirección tal cual
          let originGeocode = null;
          try {
            originGeocode = await Location.geocodeAsync(origin);
          } catch (geocodeError) {
            // Si falla la geocodificación, intentar con contexto de ciudad
            try {
              const userCity = await getUserCity();
              if (userCity) {
                originGeocode = await Location.geocodeAsync(`${origin}, ${userCity}`);
              }
            } catch (retryError) {
              console.warn('Error geocodificando origen con ciudad:', retryError);
            }
          }
          
          // Si no hay resultados, intentar con contexto de ciudad
          if (!originGeocode || originGeocode.length === 0) {
            try {
              const userCity = await getUserCity();
              if (userCity) {
                originGeocode = await Location.geocodeAsync(`${origin}, ${userCity}`);
              }
            } catch (retryError) {
              console.warn('Error geocodificando origen con ciudad (segundo intento):', retryError);
            }
          }
          
          if (originGeocode && originGeocode.length > 0) {
            originCoords = {
              latitude: originGeocode[0].latitude,
              longitude: originGeocode[0].longitude,
            };
            // Formatear dirección completa
            const addr = originGeocode[0];
            const street = addr.street || '';
            const streetNumber = addr.streetNumber || '';
            const city = addr.city || '';
            const district = addr.district || addr.subregion || '';
            
            if (street) {
              originAddress = `${street}${streetNumber ? ' ' + streetNumber : ''}`;
              if (district && district !== city) {
                originAddress += `, ${district}`;
              } else if (city) {
                originAddress += `, ${city}`;
              }
            } else {
              originAddress = origin;
            }
          } else {
            throw new Error('No se encontró la dirección de origen');
          }
        } catch (error) {
          console.warn('Error geocodificando origen:', error);
          // Si el servicio de geocodificación no está disponible, mostrar mensaje más amigable
          if (error.message && (error.message.includes('UNAVAILABLE') || error.message.includes('rejected'))) {
            showToast('El servicio de geocodificación no está disponible. Usá el mapa para seleccionar la ubicación.');
          } else if (userLocation) {
            // Si el geocoding falla pero tenemos ubicación del usuario, usar esa
            originCoords = {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            };
            originAddress = origin || 'Mi ubicación actual';
            showToast('Usando tu ubicación actual como origen');
          } else {
            showToast('No se pudo encontrar la dirección de origen. Verificá la dirección o usá el mapa.');
            return;
          }
        }
      } else if (userLocation) {
        // Si es ubicación actual, obtener dirección completa
        try {
          const address = await getAddressFromLocation(userLocation.latitude, userLocation.longitude);
          originAddress = address || 'Mi ubicación actual';
        } catch (error) {
          console.warn('Error obteniendo dirección de ubicación actual:', error);
          originAddress = 'Mi ubicación actual';
        }
      }

      // Geocodificar destino
      if (destination) {
        // Si tenemos coordenadas del pin, usarlas directamente sin geocodificar
        if (destinationPinCoords) {
          destinationCoords = destinationPinCoords;
          destinationAddress = destination;
        } else {
          try {
            // Intentar con la dirección tal cual
            let destGeocode = null;
            try {
              destGeocode = await Location.geocodeAsync(destination);
            } catch (geocodeError) {
              // Si falla la geocodificación, intentar con contexto de ciudad
              try {
                const userCity = await getUserCity();
                if (userCity) {
                  destGeocode = await Location.geocodeAsync(`${destination}, ${userCity}`);
                }
              } catch (retryError) {
                console.warn('Error geocodificando destino con ciudad:', retryError);
              }
            }
            
            // Si no hay resultados, intentar con contexto de ciudad
            if (!destGeocode || destGeocode.length === 0) {
              try {
                const userCity = await getUserCity();
                if (userCity) {
                  destGeocode = await Location.geocodeAsync(`${destination}, ${userCity}`);
                }
              } catch (retryError) {
                console.warn('Error geocodificando destino con ciudad (segundo intento):', retryError);
              }
            }
            
          if (destGeocode && destGeocode.length > 0) {
            destinationCoords = {
              latitude: destGeocode[0].latitude,
              longitude: destGeocode[0].longitude,
            };
              // Formatear dirección completa
              const addr = destGeocode[0];
              const street = addr.street || '';
              const streetNumber = addr.streetNumber || '';
              const city = addr.city || '';
              const district = addr.district || addr.subregion || '';
              
              if (street) {
                destinationAddress = `${street}${streetNumber ? ' ' + streetNumber : ''}`;
                if (district && district !== city) {
                  destinationAddress += `, ${district}`;
                } else if (city) {
                  destinationAddress += `, ${city}`;
                }
              } else {
                destinationAddress = destination;
              }
            } else {
              throw new Error('No se encontró la dirección de destino');
          }
        } catch (error) {
          console.warn('Error geocodificando destino:', error);
            // Si el servicio de geocodificación no está disponible, mostrar mensaje más amigable
            if (error.message && (error.message.includes('UNAVAILABLE') || error.message.includes('rejected'))) {
              showToast('El servicio de geocodificación no está disponible. Usá el mapa para seleccionar la ubicación.');
            } else if (destinationPin) {
              // Si el geocoding falla pero tenemos un pin de destino, usar esas coordenadas
              destinationCoords = destinationPin;
              destinationAddress = destination || pinAddress || 'Destino seleccionado';
              showToast('Usando la ubicación del pin como destino');
            } else {
              showToast('No se pudo encontrar la dirección de destino. Verificá la dirección o usá el mapa.');
              return;
            }
          }
        }
      } else {
        showToast('Por favor ingresá un destino');
        return;
      }

      if (!originCoords || !destinationCoords) {
        showToast('No se pudieron obtener las coordenadas. Verificá las direcciones.');
        return;
      }

      // Formatear datos para la API (necesita address y coordenadas)
      const originData = {
        address: originAddress,
        latitude: originCoords.latitude,
        longitude: originCoords.longitude,
      };

      const destinationData = {
        address: destinationAddress,
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
      };

      const newRide = await requestRide(originData, destinationData, paymentMethod);
      
      // El backend puede devolver el ID como 'id' o '_id', y puede estar en data.data o directamente
      const rideId = newRide?.id || newRide?._id || newRide?.data?.id || newRide?.data?._id;

      if (!rideId) {
        console.error('Respuesta del backend:', newRide);
        showToast('Error: No se pudo obtener el ID del viaje');
        return;
      }

      // Pasar datos en formato que espera RideTrackingScreen
      navigation.navigate(ROUTES.RIDE_TRACKING, {
        rideId,
        origin: originCoords,
        destination: destinationCoords,
        paymentMethod,
        // También pasar en formato del backend por si acaso
        origen: {
          lat: originCoords.latitude,
          lng: originCoords.longitude,
          direccion: originAddress,
        },
        destino: {
          lat: destinationCoords.latitude,
          lng: destinationCoords.longitude,
          direccion: destinationAddress,
        },
        ...newRide,
      });
    } catch (e) {
      console.error('Error al solicitar viaje:', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'No se pudo solicitar el viaje';
      showToast(errorMessage);
    }
  }, [origin, destination, paymentMethod, userLocation, requestRide, navigation, getAddressFromLocation, getUserCity]);

  const handleGoToHome = useCallback(() => {
    // Scroll al inicio y recargar ubicación
    reloadLocation();
  }, [reloadLocation]);

  // Obtener ciudad del usuario desde su ubicación
  const getUserCity = useCallback(async () => {
    if (!userLocation?.latitude || !userLocation?.longitude) {
      return null;
    }
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      if (addresses && addresses.length > 0) {
        return addresses[0].city || addresses[0].region || null;
      }
    } catch (error) {
      console.warn('Error obteniendo ciudad del usuario:', error);
    }
    return null;
  }, [userLocation]);

  // Función para buscar sugerencias de direcciones
  const searchAddressSuggestions = useCallback(async (query, isOrigin = true) => {
    if (!query || query.length < 3) {
      if (isOrigin) {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }

    try {
      setIsGeocoding(true);
      
      // Obtener ciudad del usuario para contexto
      const userCity = await getUserCity();
      
      // Construir query con contexto de ciudad si está disponible
      let searchQuery = query;
      if (userCity && !query.toLowerCase().includes(userCity.toLowerCase())) {
        // Agregar ciudad al query para mejorar resultados
        searchQuery = `${query}, ${userCity}`;
      }
      
      let results = [];
      try {
        results = await Location.geocodeAsync(searchQuery);
      } catch (error) {
        console.warn('Error geocodificando búsqueda:', error);
        // Si el servicio no está disponible, retornar array vacío
        if (error.message && error.message.includes('UNAVAILABLE')) {
          return [];
        }
        throw error;
      }
      
      if (results && results.length > 0) {
        // Agrupar por calle para detectar duplicados
        const streetMap = new Map();
        
        results.forEach((result) => {
          const street = result.street || '';
          const streetNumber = result.streetNumber || '';
          const city = result.city || '';
          const district = result.district || result.subregion || '';
          const region = result.region || '';
          
          // Clave única por calle
          const streetKey = street.toLowerCase();
          
          if (!streetMap.has(streetKey)) {
            streetMap.set(streetKey, []);
          }
          streetMap.get(streetKey).push({
            street,
            streetNumber,
            city,
            district,
            region,
            latitude: result.latitude,
            longitude: result.longitude,
          });
        });

        // Procesar resultados y formatear direcciones
        const suggestions = [];
        let count = 0;
        const maxResults = 5;

        for (const [streetKey, addresses] of streetMap.entries()) {
          if (count >= maxResults) break;
          
          addresses.forEach((addr) => {
            if (count >= maxResults) return;
            
            // Formatear dirección completa
            let fullAddress = '';
            if (addr.street) {
              fullAddress = `${addr.street}${addr.streetNumber ? ' ' + addr.streetNumber : ''}`;
            }
            
            // Si hay múltiples direcciones con la misma calle, mostrar barrio/ciudad
            const hasDuplicates = addresses.length > 1;
            if (hasDuplicates) {
              // Mostrar barrio o ciudad para diferenciar
              if (addr.district && addr.district !== addr.city) {
                fullAddress += fullAddress ? `, ${addr.district}` : addr.district;
              } else if (addr.city) {
                fullAddress += fullAddress ? `, ${addr.city}` : addr.city;
              }
            } else if (addr.city) {
              // Si no hay duplicados pero hay ciudad, mostrarla
              fullAddress += fullAddress ? `, ${addr.city}` : addr.city;
            }
            
            // Agregar región si es diferente de la ciudad
            if (addr.region && addr.region !== addr.city && !fullAddress.includes(addr.region)) {
              fullAddress += fullAddress ? `, ${addr.region}` : addr.region;
            }
            
            suggestions.push({
              id: `${addr.latitude}-${addr.longitude}-${count}`,
              address: fullAddress || query,
              street: addr.street,
              streetNumber: addr.streetNumber,
              city: addr.city,
              district: addr.district,
              region: addr.region,
              latitude: addr.latitude,
              longitude: addr.longitude,
            });
            count++;
          });
        }

        if (suggestions.length > 0) {
          if (isOrigin) {
            setOriginSuggestions(suggestions);
            setShowOriginSuggestions(true);
          } else {
            setDestinationSuggestions(suggestions);
            setShowDestinationSuggestions(true);
          }
        } else {
          if (isOrigin) {
            setOriginSuggestions([]);
            setShowOriginSuggestions(false);
          } else {
            setDestinationSuggestions([]);
            setShowDestinationSuggestions(false);
          }
        }
      } else {
        if (isOrigin) {
          setOriginSuggestions([]);
          setShowOriginSuggestions(false);
        } else {
          setDestinationSuggestions([]);
          setShowDestinationSuggestions(false);
        }
      }
    } catch (error) {
      console.warn('Error buscando direcciones:', error);
      if (isOrigin) {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    } finally {
      setIsGeocoding(false);
    }
  }, [getUserCity]);

  // Manejar cambio en origen con debounce
  const handleOriginChange = useCallback((text) => {
    setOrigin(text);
    setShowOriginSuggestions(false);
    // Limpiar timeout anterior
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    // Debounce para buscar sugerencias
    originTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(text, true);
    }, 500);
  }, [searchAddressSuggestions]);

  // Manejar cambio en destino con debounce
  const handleDestinationChange = useCallback((text) => {
    setDestination(text);
    setShowDestinationSuggestions(false);
    // Limpiar coordenadas del pin si el usuario cambia el destino manualmente
    setDestinationPinCoords(null);
    setDestinationPin(null);
    // Limpiar timeout anterior
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    // Debounce para buscar sugerencias
    destinationTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(text, false);
    }, 500);
  }, [searchAddressSuggestions]);

  // Seleccionar sugerencia de origen
  const handleSelectOriginSuggestion = useCallback((suggestion) => {
    setOrigin(suggestion.address);
    setShowOriginSuggestions(false);
  }, []);

  // Seleccionar sugerencia de destino
  const handleSelectDestinationSuggestion = useCallback((suggestion) => {
    setDestination(suggestion.address);
    setShowDestinationSuggestions(false);
  }, []);

  const handleSelectOrigin = useCallback((selectedAddress) => {
    if (selectedAddress === 'current') {
      // Usar ubicación actual
      if (userLocation?.latitude && userLocation?.longitude) {
        getAddressFromLocation(userLocation.latitude, userLocation.longitude).then((address) => {
          if (address) {
            setOrigin(address);
          } else {
            setOrigin('Mi ubicación actual');
          }
        });
      } else {
        setOrigin('Mi ubicación actual');
      }
    } else {
      // Usar dirección guardada
      setOrigin(selectedAddress.direccionCompleta || `${selectedAddress.calle} ${selectedAddress.altura || ''}, ${selectedAddress.ciudad}`.trim());
    }
    setShowAddressSelector(false);
  }, [userLocation, getAddressFromLocation]);

  // Manejar selección de destino desde direcciones guardadas
  const handleSelectDestination = useCallback((selectedAddress) => {
    if (selectedAddress === 'current') {
      // Usar ubicación actual como destino
      if (userLocation?.latitude && userLocation?.longitude) {
        getAddressFromLocation(userLocation.latitude, userLocation.longitude).then((address) => {
          if (address) {
            setDestination(address);
          } else {
            setDestination('Mi ubicación actual');
          }
        });
      } else {
        setDestination('Mi ubicación actual');
      }
    } else {
      // Usar dirección guardada
      setDestination(selectedAddress.direccionCompleta || `${selectedAddress.calle} ${selectedAddress.altura || ''}, ${selectedAddress.ciudad}`.trim());
    }
    setShowDestinationAddressSelector(false);
  }, [userLocation, getAddressFromLocation]);

  // Manejar toque en el mapa para poner pin de destino
  const handleMapPress = useCallback(async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    if (!coordinate || !coordinate.latitude || !coordinate.longitude) {
      return;
    }
    
    const { latitude, longitude } = coordinate;
    
    // Colocar el pin primero
    setDestinationPin({ latitude, longitude });
    
    // Intentar obtener dirección desde las coordenadas
    try {
      const address = await getAddressFromLocation(latitude, longitude);
      if (address) {
        setPinAddress(address);
        setShowPinConfirmation(true);
      } else {
        // Si no se puede obtener la dirección, usar coordenadas como fallback
        setPinAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setShowPinConfirmation(true);
      }
    } catch (error) {
      console.warn('Error obteniendo dirección del pin:', error);
      // Si falla el geocoding, usar coordenadas como fallback
      setPinAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setShowPinConfirmation(true);
      showToast('No se pudo obtener la dirección, pero podés usar esta ubicación');
    }
  }, [getAddressFromLocation]);

  // Confirmar uso de dirección del pin
  const handleConfirmPinDestination = useCallback(() => {
    if (pinAddress && destinationPin) {
      setDestination(pinAddress);
      // Guardar coordenadas del pin para usarlas directamente sin geocodificar
      setDestinationPinCoords(destinationPin);
      setShowPinConfirmation(false);
      setDestinationPin(null);
      setPinAddress('');
    }
  }, [pinAddress, destinationPin]);

  // Cancelar uso de dirección del pin
  const handleCancelPinDestination = useCallback(() => {
    setShowPinConfirmation(false);
    setDestinationPin(null);
    setPinAddress('');
    setDestinationPinCoords(null);
  }, []);

  const userAvatar = user?.avatar || user?.photo || null;

  // Validación final antes de renderizar - asegurar que safeTheme.colors existe
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      primary: '#007AFF',
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <AppHeader showBackButton={false} onProfilePress={() => setShowProfileMenu(true)} />

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {mapRegion ? (
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
            onPress={handleMapPress}
          >
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Tu ubicación"
              >
                <View style={styles.userMarker}>
                  <Ionicons name="person" size={24} color="#007AFF" />
                </View>
              </Marker>
            )}
            {destinationPin && (
              <Marker
                coordinate={destinationPin}
                title="Destino"
              >
                <View style={styles.destinationPinMarker}>
                  <Ionicons name="location" size={20} color="#e53935" />
                </View>
              </Marker>
            )}
          </MapView>
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: safeTheme.colors.surface }]}>
            <Ionicons name="map-outline" size={48} color={safeTheme.colors.textSecondary} />
            <Text style={[styles.mapPlaceholderText, { color: safeTheme.colors.textSecondary }]}>Cargando mapa...</Text>
          </View>
        )}
      </View>

      {/* Formulario de pedido */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.formContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            setShowOriginSuggestions(false);
            setShowDestinationSuggestions(false);
          }}
        >
          <View style={styles.originContainer}>
            <View style={styles.originInputWrapper}>
          <InputField
            label="Origen"
            value={origin}
                onChangeText={handleOriginChange}
            placeholder="Tu ubicación actual"
            icon="location"
                containerStyle={styles.originInput}
          />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: safeTheme.colors.surface, borderColor: safeTheme.colors.border }]}>
                  <FlatList
                    data={originSuggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.suggestionItem, { borderBottomColor: safeTheme.colors.border }]}
                        onPress={() => handleSelectOriginSuggestion(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="location" size={20} color={safeTheme.colors.primary} style={styles.suggestionIcon} />
                        <Text style={[styles.suggestionText, { color: safeTheme.colors.text }]}>{item.address}</Text>
                      </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowAddressSelector(true)}
              style={styles.addressSelectorButton}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.destinationContainer}>
            <View style={styles.destinationInputWrapper}>
          <InputField
            label="Destino"
            value={destination}
                onChangeText={handleDestinationChange}
            placeholder="¿A dónde querés ir?"
            icon="flag"
                containerStyle={styles.destinationInput}
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: safeTheme.colors.surface, borderColor: safeTheme.colors.border }]}>
                  <FlatList
                    data={destinationSuggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.suggestionItem, { borderBottomColor: safeTheme.colors.border }]}
                        onPress={() => handleSelectDestinationSuggestion(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="location" size={20} color={safeTheme.colors.primary} style={styles.suggestionIcon} />
                        <Text style={[styles.suggestionText, { color: safeTheme.colors.text }]}>{item.address}</Text>
                      </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowDestinationAddressSelector(true)}
              style={styles.addressSelectorButton}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />

          <PrimaryButton
            title="Pedir Taxi"
            onPress={handleRequestRide}
            icon="car"
            loading={loading}
            style={styles.requestButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menú de perfil */}
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />

      {/* Modal de confirmación */}
      <BookingConfirmationModal
        visible={showModal}
        origin={origin}
        destination={destination}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        customConfirmText={`Confirmar (${paymentMethod})`}
      />

      {/* Modal de selección de direcciones para origen */}
      <Modal
        visible={showAddressSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: safeTheme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: safeTheme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: safeTheme.colors.text }]}>Elegir Origen</Text>
              <TouchableOpacity
                onPress={() => setShowAddressSelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={safeTheme.colors.text} />
              </TouchableOpacity>
    </View>

            <FlatList
              data={[
                { id: 'current', type: 'current', nombre: 'Mi ubicación actual', direccionCompleta: 'Mi ubicación actual' },
                ...savedAddresses,
              ]}
              keyExtractor={(item) => item.id || item._id || String(item.createdAt)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.addressOption, { borderBottomColor: safeTheme.colors.border }]}
                  onPress={() => handleSelectOrigin(item.type === 'current' ? 'current' : item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.type === 'current' ? 'locate' : 'location'}
                    size={24}
                    color={safeTheme.colors.primary}
                    style={styles.addressOptionIcon}
                  />
                  <View style={styles.addressOptionText}>
                    <Text style={[styles.addressOptionName, { color: safeTheme.colors.text }]}>
                      {item.type === 'current' ? 'Mi ubicación actual' : item.nombre}
                    </Text>
                    {item.direccionCompleta && item.type !== 'current' && (
                      <Text style={[styles.addressOptionAddress, { color: safeTheme.colors.textSecondary }]}>{item.direccionCompleta}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={safeTheme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyAddressesContainer}>
                  <Ionicons name="location-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyAddressesText}>No tenés direcciones guardadas</Text>
                  <Text style={styles.emptyAddressesSubtext}>
                    Podés agregar direcciones en "Mis Direcciones"
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal de selección de direcciones para destino */}
      <Modal
        visible={showDestinationAddressSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDestinationAddressSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: safeTheme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: safeTheme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: safeTheme.colors.text }]}>Elegir Destino</Text>
              <TouchableOpacity
                onPress={() => setShowDestinationAddressSelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={safeTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { id: 'current', type: 'current', nombre: 'Mi ubicación actual', direccionCompleta: 'Mi ubicación actual' },
                ...savedAddresses,
              ]}
              keyExtractor={(item) => item.id || item._id || String(item.createdAt)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.addressOption, { borderBottomColor: safeTheme.colors.border }]}
                  onPress={() => handleSelectDestination(item.type === 'current' ? 'current' : item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.type === 'current' ? 'locate' : 'location'}
                    size={24}
                    color={safeTheme.colors.primary}
                    style={styles.addressOptionIcon}
                  />
                  <View style={styles.addressOptionText}>
                    <Text style={[styles.addressOptionName, { color: safeTheme.colors.text }]}>
                      {item.type === 'current' ? 'Mi ubicación actual' : item.nombre}
                    </Text>
                    {item.direccionCompleta && item.type !== 'current' && (
                      <Text style={[styles.addressOptionAddress, { color: safeTheme.colors.textSecondary }]}>{item.direccionCompleta}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={safeTheme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyAddressesContainer}>
                  <Ionicons name="location-outline" size={48} color={safeTheme.colors.textSecondary} />
                  <Text style={[styles.emptyAddressesText, { color: safeTheme.colors.text }]}>No tenés direcciones guardadas</Text>
                  <Text style={[styles.emptyAddressesSubtext, { color: safeTheme.colors.textSecondary }]}>
                    Podés agregar direcciones en "Mis Direcciones"
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de pin en el mapa */}
      <Modal
        visible={showPinConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPinDestination}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pinConfirmationModal, { backgroundColor: safeTheme.colors.surface }]}>
            <View style={styles.pinConfirmationHeader}>
              <Ionicons name="location" size={32} color={safeTheme.colors.primary} />
              <Text style={[styles.pinConfirmationTitle, { color: safeTheme.colors.text }]}>¿Usar esta dirección como destino?</Text>
            </View>
            <View style={[styles.pinConfirmationAddress, { backgroundColor: safeTheme.isDarkMode ? '#2D3748' : '#F3F4F6' }]}>
              <Text style={[styles.pinConfirmationAddressText, { color: safeTheme.colors.text }]}>{pinAddress}</Text>
            </View>
            <View style={styles.pinConfirmationButtons}>
              <TouchableOpacity
                style={[styles.pinConfirmationButton, styles.pinConfirmationButtonNo, { 
                  backgroundColor: safeTheme.isDarkMode ? '#374151' : '#F3F4F6',
                  borderColor: safeTheme.isDarkMode ? '#4B5563' : '#D1D5DB'
                }]}
                onPress={handleCancelPinDestination}
                activeOpacity={0.7}
              >
                <Text style={[styles.pinConfirmationButtonTextNo, { color: safeTheme.colors.text }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pinConfirmationButton, styles.pinConfirmationButtonYes]}
                onPress={handleConfirmPinDestination}
                activeOpacity={0.7}
              >
                <Text style={styles.pinConfirmationButtonTextYes}>Sí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  userMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  formContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  requestButton: {
    marginTop: 8,
  },
  originContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  originInputWrapper: {
    flex: 1,
  },
  originInput: {
    marginBottom: 0,
  },
  addressSelectorButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  destinationInputWrapper: {
    flex: 1,
  },
  destinationInput: {
    marginBottom: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  addressOptionIcon: {
    marginRight: 12,
  },
  addressOptionText: {
    flex: 1,
  },
  addressOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressOptionAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyAddressesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAddressesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAddressesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  destinationPinMarker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 2,
    borderWidth: 2,
    borderColor: '#e53935',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinConfirmationModal: {
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  pinConfirmationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pinConfirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  pinConfirmationAddress: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  pinConfirmationAddressText: {
    fontSize: 16,
    textAlign: 'center',
  },
  pinConfirmationButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  pinConfirmationButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinConfirmationButtonYes: {
    backgroundColor: '#007AFF',
  },
  pinConfirmationButtonTextNo: {
    fontSize: 16,
    fontWeight: '600',
  },
  pinConfirmationButtonTextYes: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
