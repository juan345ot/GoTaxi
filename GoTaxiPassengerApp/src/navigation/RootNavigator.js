import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { ROUTES } from './routes';
import RideRequestScreen from '../screens/Booking/RideRequestScreen';
import RideTrackingScreen from '../screens/Booking/RideTrackingScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SupportDetailScreen from '../screens/Support/SupportDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name={ROUTES.RIDE_REQUEST} component={RideRequestScreen} />
          <Stack.Screen name={ROUTES.RIDE_TRACKING} component={RideTrackingScreen} />
          <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
          <Stack.Screen name={ROUTES.SUPPORT_DETAIL} component={SupportDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

