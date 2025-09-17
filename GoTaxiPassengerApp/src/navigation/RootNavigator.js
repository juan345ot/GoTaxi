import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';

// Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// App
import DrawerNavigator from './DrawerNavigator';

// Booking
import RideRequestScreen from '../screens/Booking/RideRequestScreen';
import RideTrackingScreen from '../screens/Booking/RideTrackingScreen';
import TripSummaryScreen from '../screens/Booking/TripSummaryScreen';
import PaymentMethodScreen from '../screens/Booking/PaymentMethodScreen';
import RateRideScreen from '../screens/Booking/RateRideScreen';

// Soporte
import SupportScreen from '../screens/Support/SupportScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />

      {/* App (drawer/tab) */}
      <Stack.Screen name={ROUTES.HOME} component={DrawerNavigator} />

      {/* Booking */}
      <Stack.Screen name={ROUTES.RIDE_REQUEST} component={RideRequestScreen} />
      <Stack.Screen name={ROUTES.RIDE_TRACKING} component={RideTrackingScreen} />
      <Stack.Screen name={ROUTES.TRIP_SUMMARY} component={TripSummaryScreen} />
      <Stack.Screen name={ROUTES.PAYMENT_METHOD} component={PaymentMethodScreen} />
      <Stack.Screen name={ROUTES.RATE_RIDE} component={RateRideScreen} />

      {/* Soporte */}
      <Stack.Screen name={ROUTES.SUPPORT} component={SupportScreen} />
    </Stack.Navigator>
  );
}
