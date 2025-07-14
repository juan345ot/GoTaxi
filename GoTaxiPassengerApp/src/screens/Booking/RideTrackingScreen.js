import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import TaxiMap from '../../components/map/TaxiMap';
import DriverInfoCard from '../../components/booking/DriverInfoCard';
import { t } from '../../translations';

const MULTA_BEFORE = 500;
const MULTA_AFTER = 1500;

export default function RideTrackingScreen({ route, navigation }) {
  const {
    origin = { latitude: -34.61, longitude: -58.38 },
    destination = { latitude: -34.62, longitude: -58.44 },
    driver,
    vehicle,
  } = route.params || {};

  const [taxiPosition, setTaxiPosition] = useState(origin);
  const [progress, setProgress] = useState(0);
  const [estado, setEstado] = useState('esperandoTaxi');
  const [usuarioArriba, setUsuarioArriba] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (estado === 'esperandoTaxi' && progress < 0.2) {
      const timer = setTimeout(() => setProgress((p) => Math.min(0.2, p + 0.018)), 100);
      setTaxiPosition({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
      });
      if (progress >= 0.2) setEstado('confirmarSubida');
      return () => clearTimeout(timer);
    }
    if (estado === 'enCurso' && progress < 1) {
      const timer = setTimeout(() => setProgress((p) => Math.min(1, p + 0.014)), 110);
      setTaxiPosition({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
      });
      if (progress >= 1) {
        navigation.replace('TripSummary', {
          origin,
          destination,
          distancia: 3200,
          duration: 15,
          driver,
          vehicle,
        });
      }
      return () => clearTimeout(timer);
    }
  }, [estado, progress, origin, destination]);

  const handleSOS = () => {
    Alert.alert(
      t('emergency'),
      t('emergency_confirm'),
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes_cancel'), onPress: () => Alert.alert(t('calling')) }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(t('share_trip'), t('share_sent'));
  };

  const handleChat = () => {
    Alert.alert(t('chat'), t('chat'));
  };

  const handleCall = () => {
    Alert.alert(t('call_driver'));
  };

  const handleConfirmarSubida = () => {
    setUsuarioArriba(true);
    setEstado('enCurso');
    setProgress(0.21);
  };

  const handleCancelar = () => {
    const multa = estado === 'enCurso' ? MULTA_AFTER : MULTA_BEFORE;
    setCancelando(true);
    Alert.alert(
      t('cancel_trip_btn'),
      t('cancel_warning_dialog', { fine: multa }),
      [
        { text: t('no'), style: 'cancel', onPress: () => setCancelando(false) },
        {
          text: t('yes_cancel'),
          style: 'destructive',
          onPress: () => {
            setCancelando(false);
            navigation.replace('TripSummary', {
              origin,
              destination,
              driver,
              vehicle,
              distancia: 0,
              duration: 0,
              multa,
              cancelado: true,
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TaxiMap
        origin={origin}
        destination={destination}
        taxiPosition={taxiPosition}
        onPressSOS={handleSOS}
        onPressShare={handleShare}
        onPressChat={handleChat}
        onPressCall={handleCall}
        chatEnabled={true}
        callEnabled={true}
      />
      <View style={styles.infoBox}>
        <DriverInfoCard driver={driver} vehicle={vehicle} />
        {estado === 'esperandoTaxi' && (
          <Text style={styles.estado}>{t('taxi_on_the_way')}</Text>
        )}
        {estado === 'confirmarSubida' && !usuarioArriba && (
          <>
            <Text style={styles.estadoBold}>{t('confirm_board')}</Text>
            <TouchableOpacity style={styles.btnSubi} onPress={handleConfirmarSubida} accessibilityLabel={t('confirm_board')}>
              <Text style={styles.btnSubiText}>{t('confirm_board')}</Text>
            </TouchableOpacity>
            <Text style={styles.estado}>{t('tell_driver')}</Text>
          </>
        )}
        {estado === 'enCurso' && (
          <Text style={styles.estado}>{t('trip_in_progress')}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.cancelBtn, cancelando && { opacity: 0.4 }]}
        onPress={handleCancelar}
        disabled={cancelando}
        accessibilityLabel={t('cancel_trip_btn')}
      >
        <Text style={styles.cancelBtnText}>{t('cancel_trip_btn')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  infoBox: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estado: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  estadoBold: {
    marginTop: 8,
    fontSize: 17,
    color: '#007aff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  btnSubi: {
    marginTop: 14,
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 37,
    elevation: 4,
    minHeight: 48,
    minWidth: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubiText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 34,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#e53935',
    minHeight: 48,
  },
  cancelBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
