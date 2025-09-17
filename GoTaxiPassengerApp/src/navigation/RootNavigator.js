import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';

// Booking
import RideRequestScreen from '../screens/Booking/RideRequestScreen';
import RideTrackingScreen from '../screens/Booking/RideTrackingScreen';
import TripSummaryScreen from '../screens/Booking/TripSummaryScreen';
import PaymentMethodScreen from '../screens/Booking/PaymentMethodScreen';
import RateRideScreen from '../screens/Booking/RateRideScreen';

// Soporte
import SupportScreen from '../screens/Support/SupportScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
       {/* 
+        Ajuste de rutas: se usa el nombre "Login" en lugar de "AuthLogin"
+        para coincidir con las constantes de ruta (ROUTES.LOGIN) y evitar 
+        errores al navegar a la pantalla de login.
+      */}
+     <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={DrawerNavigator} />
      {/* --- Flujo de viajes --- */}
      <Stack.Screen name="RideRequest" component={RideRequestScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="RateRide" component={RateRideScreen} />
      {/* --- Soporte --- */}
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}
