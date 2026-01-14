import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LazyScreen from '../components/common/LazyScreen';
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
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <LazyScreen componentName="Booking/HomeScreen" {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Historial de viajes"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <LazyScreen componentName="History/HistoryScreen" {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Perfil"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <LazyScreen componentName="Profile/ProfileScreen" {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Soporte"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <LazyScreen componentName="Support/SupportScreen" {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Mis Direcciones"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <LazyScreen componentName="Addresses/AddressesScreen" {...props} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
