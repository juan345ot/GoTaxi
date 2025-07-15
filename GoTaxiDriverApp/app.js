import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/common/Toast';

export default function App() {
  return (
    <ToastProvider>
      <AppNavigator />
    </ToastProvider>
  );
}
