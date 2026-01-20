import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Driver/HomeScreen';
import TripRequestScreen from '../screens/Driver/TripRequestScreen';
import ActiveTripScreen from '../screens/Driver/ActiveTripScreen';
// import CurrentTripScreen from '../screens/Driver/CurrentTripScreen';
import HistoryScreen from '../screens/Driver/HistoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChatSupportScreen from '../screens/Chat/ChatSupportScreen';
import PassengerRatingScreen from '../screens/Driver/PassengerRatingScreen';

const Stack = createStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TripRequestScreen" component={TripRequestScreen} options={{ title: 'Solicitudes de Viaje' }} />
      <Stack.Screen name="ActiveTripScreen" component={ActiveTripScreen} options={{ title: 'Viaje Activo', headerShown: false }} />
      <Stack.Screen name="PassengerRatingScreen" component={PassengerRatingScreen} options={{ title: 'Califica al pasajero' }} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'Historial de Viajes' }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="ChatSupportScreen" component={ChatSupportScreen} options={{ title: 'Soporte' }} />
    </Stack.Navigator>
  );
}
