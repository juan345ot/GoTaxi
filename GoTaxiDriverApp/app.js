import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/common/Toast';
import { UserProvider } from './src/contexts/UserContext';
import { TripProvider } from './src/contexts/TripContext';

export default function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <TripProvider>
          <AppNavigator />
        </TripProvider>
      </UserProvider>
    </ToastProvider>
  );
}
