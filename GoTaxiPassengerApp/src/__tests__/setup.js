// Mock completo de React Native - DEBE estar primero
const mockDimensions = {
  width: 375,
  height: 812,
  scale: 2,
  fontScale: 1,
};

jest.mock('react-native', () => {
  const React = require('react');

  // Crear componentes mock que React Native Testing Library pueda reconocer
  const createMockComponent = (name) => {
    const MockComponent = (props) => {
      const { children, testID, ...otherProps } = props;
      // Retornar un elemento div con testID para que React Native Testing Library lo reconozca
      return React.createElement('div', {
        'data-testid': testID || name.toLowerCase(),
        ...otherProps,
      }, children);
    };
    MockComponent.displayName = name;
    // Agregar forwardRef para compatibilidad
    const ForwardedComponent = React.forwardRef((props, ref) => {
      return MockComponent({ ...props, ref });
    });
    ForwardedComponent.displayName = name;
    return ForwardedComponent;
  };

  return {
    __esModule: true,
    default: {},
    NativeModules: {
      DeviceInfo: {
        getConstants: jest.fn(() => ({})),
      },
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => mockDimensions),
      set: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      screen: mockDimensions,
      window: mockDimensions,
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      roundToNearestPixel: jest.fn((value) => value),
    },
    InteractionManager: {
      runAfterInteractions: jest.fn((callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      createInteractionHandle: jest.fn(() => 1),
      clearInteractionHandle: jest.fn(),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
    View: createMockComponent('View'),
    Text: createMockComponent('Text'),
    ScrollView: createMockComponent('ScrollView'),
    Image: createMockComponent('Image'),
    ActivityIndicator: createMockComponent('ActivityIndicator'),
    TouchableOpacity: createMockComponent('TouchableOpacity'),
    FlatList: createMockComponent('FlatList'),
  };
});

// Mock de usePerformanceOptimization
jest.mock('../hooks/usePerformanceOptimization', () => ({
  useDebounce: jest.fn((fn) => fn),
  useThrottle: jest.fn((fn) => fn),
}));

// Mock de TurboModuleRegistry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => ({
    getConstants: jest.fn(() => ({})),
  })),
  getEnforcing: jest.fn(() => ({
    getConstants: jest.fn(() => ({})),
  })),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock de react-native-root-toast
jest.mock('react-native-root-toast', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock de react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => <View {...props} ref={ref} />),
    Marker: View,
    Polyline: View,
    Circle: View,
  };
});

// Mock de expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
}));

// Mock de dompurify (solo si está disponible)
try {
  jest.mock('dompurify', () => ({
    sanitize: jest.fn((html) => html),
    setConfig: jest.fn(),
    clearConfig: jest.fn(),
    isValidAttribute: jest.fn(() => true),
    addHook: jest.fn(),
    removeHook: jest.fn(),
    removeAllHooks: jest.fn(),
    version: '2.0.0',
  }));
} catch {
  // dompurify no está disponible, se mockeará cuando se importe
}

// Mock de crypto-js
jest.mock('crypto-js', () => {
  const mockWordArray = {
    random: jest.fn(() => ({
      toString: () => 'mock-random-word-array',
    })),
  };

  const mockEnc = {
    Utf8: 'utf8',
    Hex: {
      parse: jest.fn((hex) => hex),
    },
  };

  const mockMode = {
    CBC: 'CBC',
  };

  const mockPad = {
    Pkcs7: 'Pkcs7',
  };

  return {
    default: {
      SHA256: jest.fn((text) => ({
        toString: () => `sha256-${text}`,
      })),
      PBKDF2: jest.fn((password, salt) => ({
        toString: () => `pbkdf2-${password}-${salt}`,
      })),
      AES: {
        encrypt: jest.fn((text) => ({
          toString: () => `encrypted-${text}`,
        })),
        decrypt: jest.fn((encrypted) => ({
          toString: (encoding) => {
            if (encoding === 'utf8') {
              return encrypted.replace('encrypted-', '');
            }
            return encrypted.replace('encrypted-', '');
          },
        })),
      },
      lib: {
        WordArray: mockWordArray,
      },
      enc: mockEnc,
      mode: mockMode,
      pad: mockPad,
    },
    SHA256: jest.fn((text) => ({
      toString: () => `sha256-${text}`,
    })),
    PBKDF2: jest.fn((password, salt) => ({
      toString: () => `pbkdf2-${password}-${salt}`,
    })),
    AES: {
      encrypt: jest.fn((text) => ({
        toString: () => `encrypted-${text}`,
      })),
      decrypt: jest.fn((encrypted) => ({
        toString: (encoding) => {
          if (encoding === 'utf8') {
            return encrypted.replace('encrypted-', '');
          }
          return encrypted.replace('encrypted-', '');
        },
      })),
    },
    lib: {
      WordArray: mockWordArray,
    },
    enc: mockEnc,
    mode: mockMode,
    pad: mockPad,
  };
});

// Mock de console para tests
if (typeof global !== 'undefined') {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Mock de navigator.geolocation
if (typeof global !== 'undefined') {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
    writable: true,
  });

  // Mock de window events
  Object.defineProperty(global.window, 'addEventListener', {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(global.window, 'removeEventListener', {
    value: jest.fn(),
    writable: true,
  });
}

// Mock de __fbBatchedBridgeConfig
if (typeof global !== 'undefined') {
  global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}
