# Tests del Frontend - GoTaxi Passenger App

## Estructura de Tests

```
src/__tests__/
├── components/          # Tests de componentes
│   ├── OptimizedFlatList.test.js
│   └── OptimizedImage.test.js
├── hooks/              # Tests de hooks personalizados
│   ├── useAuthService.test.js
│   ├── useTripService.test.js
│   ├── useUserService.test.js
│   └── usePerformance.test.js
├── services/           # Tests de servicios
│   └── AuthService.test.js
├── utils/              # Tests de utilidades
│   ├── secureStorage.test.js
│   ├── validation.test.js
│   └── securityMiddleware.test.js
├── setup.js           # Configuración global de tests
└── README.md          # Este archivo
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests específicos
npm test -- --testNamePattern="AuthService"

# Ejecutar tests de un archivo específico
npm test -- src/__tests__/services/AuthService.test.js
```

## Cobertura de Tests

Los tests cubren:

### ✅ Hooks Personalizados

- `useAuthService` - Hook para servicio de autenticación
- `useTripService` - Hook para servicio de viajes
- `useUserService` - Hook para servicio de usuario
- `usePerformance` - Hook para monitoreo de performance

### ✅ Componentes Optimizados

- `OptimizedFlatList` - Lista optimizada con estados de carga/error
- `OptimizedImage` - Imagen optimizada con lazy loading

### ✅ Servicios de Negocio

- `AuthService` - Lógica de autenticación
- `TripService` - Lógica de viajes (pendiente)
- `UserService` - Lógica de usuario (pendiente)

### ✅ Utilidades

- `secureStorage` - Almacenamiento seguro
- `validation` - Validaciones y sanitización
- `securityMiddleware` - Middleware de seguridad

## Configuración

### Jest Configuration

- **Preset**: `react-native`
- **Environment**: `jsdom`
- **Setup**: `src/__tests__/setup.js`
- **Coverage**: Incluye todos los archivos `.js/.jsx` en `src/`

### Mocks Incluidos

- `@react-native-async-storage/async-storage`
- `react-native-root-toast`
- `react-native-maps`
- `expo-location`
- `expo-notifications`
- `crypto-js`
- `InteractionManager`

## Estrategia de Testing

### 1. **Unit Tests**

- Testear lógica de negocio aislada
- Mockear dependencias externas
- Verificar comportamiento esperado

### 2. **Integration Tests**

- Testear interacción entre componentes
- Verificar flujo de datos
- Testear hooks con contextos

### 3. **Component Tests**

- Testear renderizado
- Testear interacciones del usuario
- Testear estados de carga/error

## Mejores Prácticas

### ✅ DO

- Usar `renderHook` para testear hooks
- Mockear dependencias externas
- Testear casos de éxito y error
- Usar nombres descriptivos para tests
- Agrupar tests relacionados con `describe`

### ❌ DON'T

- No testear implementación interna
- No hacer tests demasiado específicos
- No olvidar cleanup en `afterEach`
- No testear librerías de terceros

## Ejemplo de Test

```javascript
describe('AuthService', () => {
  let authService;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      register: jest.fn(),
    };
    authService = new AuthService(mockAuthRepository);
  });

  it('should login successfully with valid credentials', async () => {
    const mockResult = {
      success: true,
      data: { user: mockUser, token: 'token' },
    };
    mockAuthRepository.login.mockResolvedValue(mockResult);

    const result = await authService.login('email', 'password');

    expect(result.success).toBe(true);
    expect(mockAuthRepository.login).toHaveBeenCalledWith('email', 'password');
  });
});
```

## Próximos Pasos

1. **Completar tests de servicios restantes**
2. **Agregar tests de componentes de UI**
3. **Implementar tests de integración**
4. **Configurar CI/CD para tests automáticos**
5. **Agregar tests de accesibilidad**

## Troubleshooting

### Error: "Cannot find module"

- Verificar que el mock esté en `setup.js`
- Verificar la configuración de `moduleNameMapping`

### Error: "Test timeout"

- Aumentar timeout en configuración
- Verificar que los mocks estén funcionando

### Error: "Cannot read property of undefined"

- Verificar que los mocks retornen el tipo correcto
- Verificar que las dependencias estén mockeadas
