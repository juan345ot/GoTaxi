import React from 'react';
import { View, Text, Switch } from 'react-native';

export default function ActiveSwitch({ isActive, setIsActive }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      backgroundColor: '#f5f5f5',
      borderRadius: 12,
      padding: 14
    }}>
      <Text style={{
        fontWeight: 'bold',
        fontSize: 17,
        color: isActive ? '#007aff' : '#888',
        marginRight: 12,
      }}>
        {isActive ? '¡Recibiendo viajes!' : 'No disponible'}
      </Text>
      <Switch
        value={isActive}
        onValueChange={setIsActive}
        thumbColor={isActive ? '#007aff' : '#888'}
        trackColor={{ true: '#ffd600', false: '#bbb' }}
      />
    </View>
  );
}
