import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function PassengerRatingScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleCalificar = () => {
    Alert.alert('¡Gracias!', 'Calificación enviada.');
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>Califica al pasajero</Text>
      <View style={{ flexDirection: 'row', marginVertical: 18 }}>
        {[1,2,3,4,5].map(num => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Text style={{
              fontSize: 32,
              color: num <= rating ? '#ffd600' : '#bbb',
              marginHorizontal: 4
            }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={handleCalificar}
        style={{ backgroundColor: '#007aff', padding: 16, borderRadius: 10, marginTop: 32, width: '70%' }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Enviar calificación</Text>
      </TouchableOpacity>
    </View>
  );
}
