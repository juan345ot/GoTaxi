import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Driver/HomeScreen';

const Stack = createStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      {/* Luego agregarás más pantallas aquí */}
    </Stack.Navigator>
  );
}
