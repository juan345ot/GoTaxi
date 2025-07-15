import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import { useUser } from '../contexts/UserContext';

export default function AppNavigator() {
  const { user } = useUser();
  return (
    <NavigationContainer>
      {user ? <DriverNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
