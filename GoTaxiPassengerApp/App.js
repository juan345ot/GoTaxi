import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { HistoryProvider } from './src/contexts/HistoryContext';

export default function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </HistoryProvider>
    </AuthProvider>
  );
}
