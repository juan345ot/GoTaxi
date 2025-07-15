import React from 'react';
import { View, Text } from 'react-native';

export default function PenaltyBanner({ penaltyLevel }) {
  if (!penaltyLevel) return null;
  let message = '';
  let color = '#ffd600';

  if (penaltyLevel === 1) {
    message = 'Advertencia: rechazaste muchos viajes. Si continuás, podrías ser penalizado.';
    color = '#ff9800';
  }
  if (penaltyLevel === 2) {
    message = 'Penalización: no podés recibir viajes por 10 minutos.';
    color = '#d32f2f';
  }

  return (
    <View style={{
      backgroundColor: color,
      padding: 14,
      borderRadius: 10,
      marginVertical: 12,
      width: '95%',
      alignSelf: 'center'
    }}>
      <Text style={{ color: '#222', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
        {message}
      </Text>
    </View>
  );
}
