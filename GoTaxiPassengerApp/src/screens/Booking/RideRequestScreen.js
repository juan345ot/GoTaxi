import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { LocationContext } from '../../contexts/LocationContext';
import useAuth from '../../hooks/useAuth';
import { isFieldFilled } from '../../utils/validators';

export default function RideRequestScreen({ navigation }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const { location } = useContext(LocationContext);
  const { user } = useAuth();

  const handleRequest = () => {
    if (!isFieldFilled(origin) || !isFieldFilled(destination)) {
      setError('Debes completar ambos campos');
      return;
    }
    setError('');
    Alert.alert(
      'Confirmar viaje',
      `¿Querés solicitar un viaje de "${origin}" a "${destination}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            navigation.navigate('RideTracking', {
              origin,
              destination,
              user,
              currentLocation: location,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar un Taxi</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <InputField
        placeholder="Dirección de Origen"
        value={origin}
        onChangeText={setOrigin}
      />
      <InputField
        placeholder="Dirección de Destino"
        value={destination}
        onChangeText={setDestination}
      />

      <PrimaryButton title="Solicitar Viaje" onPress={handleRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});