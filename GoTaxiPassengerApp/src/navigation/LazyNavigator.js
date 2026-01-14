import React, { memo, useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LazyScreen from '../components/common/LazyScreen';

/**
 * Navegador optimizado con lazy loading para pantallas
 * Implementa code splitting automático para mejorar el rendimiento
 */
const LazyNavigator = memo(({
  screens = [],
  screenOptions = {},
  navigationOptions = {},
  preloadScreens = [],
  ...props
}) => {
  const Stack = createStackNavigator();

  // Configuración optimizada para las pantallas
  const optimizedScreenOptions = useMemo(() => ({
    headerShown: false,
    gestureEnabled: true,
    cardStyle: { backgroundColor: '#fff' },
    ...screenOptions,
  }), [screenOptions]);

  // Configuración de navegación optimizada
  const optimizedNavigationOptions = useMemo(() => ({
    headerMode: 'screen',
    ...navigationOptions,
  }), [navigationOptions]);

  // Crear componentes de pantalla con lazy loading
  const createLazyScreen = useMemo(() => {
    return (screenConfig) => {
      const { name, component, ...screenProps } = screenConfig;

      return (
        <Stack.Screen
          key={name}
          name={name}
          options={screenProps.options}
        >
          {(props) => (
            <LazyScreen
              componentName={component}
              preload={preloadScreens.includes(name)}
              timeout={10000}
              retryable={true}
              loadingMessage={`Cargando ${name}...`}
              {...screenProps}
              {...props}
            />
          )}
        </Stack.Screen>
      );
    };
  }, [preloadScreens]);

  return (
    <Stack.Navigator
      screenOptions={optimizedScreenOptions}
      {...optimizedNavigationOptions}
      {...props}
    >
      {screens.map(createLazyScreen)}
    </Stack.Navigator>
  );
});

LazyNavigator.displayName = 'LazyNavigator';

export default LazyNavigator;
