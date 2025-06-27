// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { LocationProvider } from './src/contexts/LocationContext';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LocationProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </LocationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
