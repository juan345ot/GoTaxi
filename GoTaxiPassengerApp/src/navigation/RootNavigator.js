import React, { memo, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import LazyScreen from '../components/common/LazyScreen';
import bundleAnalyzer from '../utils/bundleAnalyzer';

const Stack = createNativeStackNavigator();

/**
 * Navegador raíz de la aplicación con lazy loading optimizado
 * Define el flujo de auth, home y booking con code splitting
 */
const RootNavigator = memo(() => {
  // Configuración de pantallas con lazy loading
  const screens = useMemo(() => [
    // Auth screens - Cargadas inmediatamente para mejor UX
    {
      name: ROUTES.LOGIN,
      component: 'Auth/LoginScreen',
      options: { gestureEnabled: false },
    },
    {
      name: ROUTES.REGISTER,
      component: 'Auth/RegisterScreen',
      options: { gestureEnabled: false },
    },

    // Drawer principal - Precargado para mejor rendimiento
    {
      name: ROUTES.HOME,
      component: 'DrawerNavigator',
      options: { gestureEnabled: false },
    },

    // Booking screens - Lazy loaded para optimizar bundle
    {
      name: ROUTES.RIDE_REQUEST,
      component: 'Booking/RideRequestScreen',
      options: { gestureEnabled: true },
    },
    {
      name: ROUTES.RIDE_TRACKING,
      component: 'Booking/RideTrackingScreen',
      options: { gestureEnabled: true },
    },
    {
      name: ROUTES.TRIP_SUMMARY,
      component: 'Booking/TripSummaryScreen',
      options: { gestureEnabled: true },
    },
    {
      name: ROUTES.PAYMENT_METHOD,
      component: 'Booking/PaymentMethodScreen',
      options: { gestureEnabled: true },
    },
    {
      name: ROUTES.RATE_RIDE,
      component: 'Booking/RateRideScreen',
      options: { gestureEnabled: true },
    },

    // Chat - Lazy loaded
    {
      name: ROUTES.CHAT,
      component: 'Chat/ChatScreen',
      options: { gestureEnabled: true },
    },

    // Soporte - Lazy loaded
    {
      name: ROUTES.SUPPORT,
      component: 'Support/SupportScreen',
      options: { gestureEnabled: true },
    },

    // Profile screens - Lazy loaded
    {
      name: ROUTES.EDIT_PROFILE,
      component: 'Profile/EditProfileScreen',
      options: { gestureEnabled: true },
    },
    {
      name: ROUTES.CHANGE_PASSWORD,
      component: 'Profile/ChangePasswordScreen',
      options: { gestureEnabled: true },
    },
    // AddressesScreen ahora está en el DrawerNavigator, no en el Stack
    // {
    //   name: ROUTES.ADDRESSES,
    //   component: 'Addresses/AddressesScreen',
    //   options: { gestureEnabled: true },
    // },
  ], []);

  // Pantallas a precargar para mejor rendimiento
  const preloadScreens = useMemo(() => [
    ROUTES.HOME,
    ROUTES.RIDE_REQUEST,
  ], []);

  // Configuración optimizada del stack
  const screenOptions = useMemo(() => ({
    headerShown: false,
    gestureEnabled: true,
    cardStyle: { backgroundColor: '#fff' },
    animation: 'slide_from_right',
  }), []);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          options={screen.options}
        >
          {(props) => (
            <LazyScreen
              componentName={screen.component}
              preload={preloadScreens.includes(screen.name)}
              timeout={10000}
              retryable={true}
              loadingMessage={`Cargando ${screen.name}...`}
              onError={(error) => {
                // eslint-disable-next-line no-console
                if (__DEV__) console.error(`Error loading screen ${screen.name}:`, error);
                bundleAnalyzer.recordError(screen.name, error);
              }}
              {...props}
            />
          )}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
});

RootNavigator.displayName = 'RootNavigator';

export default RootNavigator;
