import AuthService from '../../services/AuthService';
import AuthRepository from '../../infrastructure/repositories/AuthRepository';
import User from '../../domain/entities/User';
import secureStorage from '../../utils/secureStorage';

// Mock de las dependencias
jest.mock('../../infrastructure/repositories/AuthRepository');
jest.mock('../../domain/entities/User');
jest.mock('../../utils/secureStorage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn().mockResolvedValue(true),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(true),
    clear: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('../../utils/xssProtection', () => ({
  __esModule: true,
  default: {
    sanitizeFormData: jest.fn((data) => data),
    detectXSS: jest.fn(() => ({ riskLevel: 'LOW' })),
  },
  sanitizeFormData: jest.fn((data) => data),
  detectXSS: jest.fn(() => ({ riskLevel: 'LOW' })),
}));
jest.mock('../../utils/securityPolicy', () => ({
  __esModule: true,
  default: {
    validateInput: jest.fn((data) => ({ isValid: true, data, warnings: [] })),
    getSecurityHeaders: jest.fn(() => ({})),
  },
  validateInput: jest.fn((data) => ({ isValid: true, data, warnings: [] })),
  getSecurityHeaders: jest.fn(() => ({})),
}));
jest.mock('../../utils/securityMiddleware', () => ({
  withLoginValidation: (fn) => async(data) => await fn(data),
  withRegistrationValidation: (fn) => async(data) => await fn(data),
  withSecurityLogging: (fn) => async(data) => await fn(data),
  withXSSProtection: (fn) => async(data) => await fn(data),
  withSecurityPolicy: (fn) => async(data) => await fn(data),
  withSecureStorage: (fn) => async(data) => await fn(data),
  withFormSecurity: (fn) => async(data) => await fn(data),
  withAdvancedSecurityLogging: (fn) => async(data) => await fn(data),
  withTokenValidation: (fn) => async(data) => await fn(data),
}));

describe('AuthService', () => {
  let authService;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
      getToken: jest.fn(),
    };

    AuthRepository.mockImplementation(() => mockAuthRepository);
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(authService.cache).toBeInstanceOf(Map);
      expect(authService.cacheTimeout).toBe(5 * 60 * 1000);
      expect(authService.maxRetries).toBe(3);
      expect(authService.retryDelay).toBe(1000);
      expect(authService.securityConfig).toBeDefined();
      expect(authService.securityMetrics).toBeDefined();
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'juan@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async() => {
      const mockUser = {
        id: '1',
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        canPerformActions: () => true,
        getFullName: () => 'Juan Pérez',
      };

      const mockResult = {
        success: true,
        data: mockUser,
      };

      mockAuthRepository.login.mockResolvedValue(mockResult);

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toContain('Buenos días, Juan Pérez');
      expect(mockAuthRepository.login).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password,
      );
      expect(secureStorage.setItem).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(secureStorage.setItem).toHaveBeenCalledWith('user_email', mockUser.email);
    });

    it('should fail login with invalid credentials', async() => {
      const mockResult = {
        success: false,
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
      };

      mockAuthRepository.login.mockResolvedValue(mockResult);

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
      expect(result.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail login for inactive user', async() => {
      const mockUser = {
        id: '1',
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        canPerformActions: () => false,
        getFullName: () => 'Juan Pérez',
      };

      const mockResult = {
        success: true,
        data: mockUser,
      };

      mockAuthRepository.login.mockResolvedValue(mockResult);

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tu cuenta está inactiva. Contacta al soporte.');
      expect(result.code).toBe('ACCOUNT_INACTIVE');
    });

    it('should handle account lockout after multiple failed attempts', async() => {
      // Simular múltiples intentos fallidos
      authService.securityMetrics.failedAttempts = 5;
      authService.securityMetrics.lastLoginAttempt = Date.now();

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cuenta bloqueada temporalmente');
      expect(result.code).toBe('ACCOUNT_LOCKED');
    });

    it('should handle repository errors with retry logic', async() => {
      const networkError = new Error('Network error');
      networkError.code = 'ECONNABORTED';

      mockAuthRepository.login
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ success: false, error: 'Final attempt failed' });

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(mockAuthRepository.login).toHaveBeenCalledTimes(3);
    });

    it('should validate email format', async() => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = await authService.login(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('El email no es válido');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password length', async() => {
      const invalidData = {
        email: 'juan@example.com',
        password: '123',
      };

      const result = await authService.login(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('La contraseña debe tener al menos 6 caracteres');
      expect(result.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('register', () => {
    const validUserData = {
      name: 'Juan',
      lastname: 'Pérez',
      email: 'juan@example.com',
      password: 'Password123!',
      phone: '+54911234567',
    };

    it('should register user successfully', async() => {
      const mockUser = {
        validate: () => ({ isValid: true, errors: [] }),
      };

      const mockResult = {
        success: true,
        data: { user: validUserData },
      };

      User.mockImplementation(() => mockUser);
      mockAuthRepository.register.mockResolvedValue(mockResult);

      const result = await authService.register(validUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult.data);
      expect(result.message).toBe('Usuario registrado exitosamente');
      expect(mockAuthRepository.register).toHaveBeenCalledWith(validUserData);
      expect(secureStorage.setItem).toHaveBeenCalledWith('user_id', validUserData.id);
    });

    it('should fail registration with invalid data', async() => {
      const invalidUserData = {
        name: 'J', // Too short
        lastname: 'Pérez',
        email: 'invalid-email',
        password: 'weak',
        phone: 'invalid-phone',
      };

      const mockUser = {
        validate: () => ({
          isValid: false,
          errors: ['Nombre inválido', 'Email inválido', 'Contraseña débil'],
        }),
      };

      User.mockImplementation(() => mockUser);

      const result = await authService.register(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nombre inválido');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should handle repository errors', async() => {
      const mockUser = {
        validate: () => ({ isValid: true, errors: [] }),
      };

      User.mockImplementation(() => mockUser);
      mockAuthRepository.register.mockRejectedValue(new Error('Network error'));

      const result = await authService.register(validUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error interno del servidor');
      expect(result.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async() => {
      const mockProfile = {
        id: '1',
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
      };

      const mockResult = {
        success: true,
        data: mockProfile,
      };

      mockAuthRepository.getProfile.mockResolvedValue(mockResult);

      const result = await authService.getProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(mockAuthRepository.getProfile).toHaveBeenCalled();
    });

    it('should handle profile fetch errors', async() => {
      mockAuthRepository.getProfile.mockRejectedValue(new Error('Network error'));

      const result = await authService.getProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error interno del servidor');
      expect(result.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async() => {
      const mockResult = {
        success: true,
        message: 'Logout exitoso',
      };

      mockAuthRepository.logout.mockResolvedValue(mockResult);

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sesión cerrada exitosamente');
      expect(mockAuthRepository.logout).toHaveBeenCalled();
      expect(secureStorage.clear).toHaveBeenCalled();
    });

    it('should handle logout errors but still clear local data', async() => {
      mockAuthRepository.logout.mockRejectedValue(new Error('Network error'));

      const result = await authService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al cerrar sesión');
      expect(secureStorage.clear).toHaveBeenCalled();
    });
  });

  describe('cache functionality', () => {
    it('should cache data correctly', () => {
      const testData = { id: '1', name: 'Test' };
      authService.setCache('test_key', testData);

      const cached = authService.getFromCache('test_key');
      expect(cached).toEqual(testData);
    });

    it('should return null for expired cache', () => {
      // Establecer timeout muy corto primero
      authService.cacheTimeout = 1; // 1ms

      const testData = { id: '1', name: 'Test' };
      authService.setCache('test_key', testData);

      // Esperar a que expire el caché
      return new Promise(resolve => {
        setTimeout(() => {
          const cached = authService.getFromCache('test_key');
          expect(cached).toBeNull();
          resolve();
        }, 10);
      });
    });

    it('should clear cache', () => {
      authService.setCache('test_key', { data: 'test' });
      authService.clearCache();

      const cached = authService.getFromCache('test_key');
      expect(cached).toBeNull();
    });
  });

  describe('retry logic', () => {
    it('should retry on retryable errors', async() => {
      const networkError = new Error('Network error');
      networkError.code = 'ECONNABORTED';

      mockAuthRepository.getProfile
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ success: true, data: {} });

      const result = await authService.getProfile();

      expect(result.success).toBe(true);
      expect(mockAuthRepository.getProfile).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async() => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };

      mockAuthRepository.getProfile.mockRejectedValue(authError);

      const result = await authService.getProfile();

      expect(result.success).toBe(false);
      expect(mockAuthRepository.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation methods', () => {
    it('should validate email format correctly', () => {
      expect(authService.isValidEmail('test@example.com')).toBe(true);
      expect(authService.isValidEmail('invalid-email')).toBe(false);
      expect(authService.isValidEmail('')).toBe(false);
    });

    it('should validate login data', () => {
      const validData = authService.validateLoginData('test@example.com', 'password123');
      expect(validData.isValid).toBe(true);
      expect(validData.errors).toHaveLength(0);

      const invalidData = authService.validateLoginData('invalid-email', '123');
      expect(invalidData.isValid).toBe(false);
      expect(invalidData.errors).toContain('El email no es válido');
      expect(invalidData.errors).toContain('La contraseña debe tener al menos 6 caracteres');
    });
  });

  describe('security features', () => {
    it('should track login attempts', () => {
      authService.recordFailedAttempt();
      expect(authService.securityMetrics.failedAttempts).toBe(1);
      expect(authService.securityMetrics.lastLoginAttempt).toBeDefined();
    });

    it('should reset failed attempts on successful login', () => {
      authService.securityMetrics.failedAttempts = 3;
      authService.recordSuccessfulLogin();
      expect(authService.securityMetrics.failedAttempts).toBe(0);
    });

    it('should detect account lockout', () => {
      authService.securityMetrics.failedAttempts = 5;
      authService.securityMetrics.lastLoginAttempt = Date.now();

      expect(authService.isAccountLocked()).toBe(true);
    });

    it('should calculate security level correctly', () => {
      expect(authService.getSecurityLevel()).toBe('LOW');

      authService.securityMetrics.securityViolations = 6;
      expect(authService.getSecurityLevel()).toBe('HIGH');
    });

    it('should get security metrics', () => {
      const metrics = authService.getSecurityMetrics();
      expect(metrics).toHaveProperty('loginAttempts');
      expect(metrics).toHaveProperty('failedAttempts');
      expect(metrics).toHaveProperty('securityLevel');
      expect(metrics).toHaveProperty('isLocked');
    });
  });

  describe('session management', () => {
    it('should check if user is authenticated', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);

      mockAuthRepository.isAuthenticated.mockReturnValue(false);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should get token', () => {
      mockAuthRepository.getToken.mockReturnValue('mock-token');
      expect(authService.getToken()).toBe('mock-token');
    });

    it('should validate session', async() => {
      secureStorage.getItem.mockResolvedValue('mock-token');
      mockAuthRepository.getProfile.mockResolvedValue({ success: true, data: { id: '1' } });

      const result = await authService.validateSession();

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should handle invalid session', async() => {
      secureStorage.getItem.mockResolvedValue(null);

      const result = await authService.validateSession();

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NO_TOKEN');
    });
  });

  describe('utility methods', () => {
    it('should generate welcome message based on time', () => {
      const user = { getFullName: () => 'Juan Pérez' };

      // Mock different hours
      const originalGetHours = Date.prototype.getHours;
      Date.prototype.getHours = jest.fn(() => 9); // Morning
      expect(authService.generateWelcomeMessage(user)).toContain('Buenos días');

      Date.prototype.getHours = jest.fn(() => 15); // Afternoon
      expect(authService.generateWelcomeMessage(user)).toContain('Buenas tardes');

      Date.prototype.getHours = jest.fn(() => 20); // Evening
      expect(authService.generateWelcomeMessage(user)).toContain('Buenas noches');

      Date.prototype.getHours = originalGetHours;
    });

    it('should get profile with cache', async() => {
      const mockProfile = { id: '1', name: 'Juan' };
      authService.setCache('user_profile', mockProfile);

      const result = await authService.getProfileWithCache();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(result.fromCache).toBe(true);
    });
  });
});
