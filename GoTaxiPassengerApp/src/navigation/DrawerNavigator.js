import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/Booking/HomeScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SupportScreen from '../screens/Support/SupportScreen';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#007aff',
        drawerInactiveTintColor: '#555',
        drawerLabelStyle: { fontWeight: '600', fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Historial de viajes"
        component={HistoryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Soporte"
        component={SupportScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
