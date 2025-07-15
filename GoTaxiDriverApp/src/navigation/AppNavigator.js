import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';

export default function AppNavigator() {
  // TODO: Reemplazar este estado por auth real
  const [user, setUser] = useState(null);

  return (
    <NavigationContainer>
      {user ? <DriverNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
