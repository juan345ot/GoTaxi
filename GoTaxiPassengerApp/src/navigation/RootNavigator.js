import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Booking/HomeScreen';
import RideRequestScreen from '../screens/Booking/RideRequestScreen';
import RideTrackingScreen from '../screens/Booking/RideTrackingScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import { AuthContext } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="RideRequest" component={RideRequestScreen} />
          <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
