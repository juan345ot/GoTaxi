import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: '', color: '#222' });
  const [fadeAnim] = useState(new Animated.Value(0));

  const showToast = useCallback((message, color = '#007aff', duration = 2000) => {
    setToast({ visible: true, message, color });
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setToast({ visible: false, message: '', color: '#222' });
      });
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View style={{
          position: 'absolute', bottom: 60, left: 20, right: 20,
          backgroundColor: toast.color,
          borderRadius: 10, padding: 15, alignItems: 'center',
          opacity: fadeAnim,
          elevation: 10,
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
