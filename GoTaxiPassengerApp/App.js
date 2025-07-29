import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </AuthProvider>
  );
}
