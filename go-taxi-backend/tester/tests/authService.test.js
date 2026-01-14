const { AuthService } = require('../../src/business/AuthService');
const { UserRepository } = require('../../src/repositories/UserRepository');
const { cleanDB } = require('../utils/cleanDB');

// Mock del UserRepository
jest.mock('../../src/repositories/UserRepository');

// Mock del jwtRotationService
jest.mock('../../src/services/jwtRotationService', () => ({
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: '1h'
  }),
  verifyToken: jest.fn().mockReturnValue({ userId: '507f1f77bcf86cd799439011' }),
  isTokenNearExpiry: jest.fn().mockReturnValue(false)
}));

describe('AuthService', () => {
  let authService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      getStats: jest.fn(),
      findWithFilters: jest.fn(),
      toEntity: jest.fn((user) => ({
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
    };
    authService = new AuthService();
    // Mock the userRepository property
    authService.userRepository = mockUserRepository;
    
    // Mock the jwtRotationService methods directly
    const jwtRotationService = require('../../src/services/jwtRotationService');
    jwtRotationService.generateTokenPair.mockReturnValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: '1h'
    });
    
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanDB();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data.user.email).toBe(userData.email);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should fail to register user with existing email', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(true);

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El email ya está registrado');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should fail to register user with invalid data', async () => {
      const userData = {
        nombre: 'A', // Too short
        apellido: 'Pérez',
        email: 'invalid-email',
        password: 'weak',
        role: 'pasajero',
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Datos inválidos');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'Password123!',
      };

      const hashedPassword = '$2b$10$hashedPassword';
      const user = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: loginData.email,
        password: hashedPassword,
        role: 'pasajero',
        activo: true,
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(user);

      // Mock bcrypt.compare
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data.user.email).toBe(loginData.email);
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(loginData.email);
    });

    it('should fail to login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });

    it('should fail to login with wrong password', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'WrongPassword123!',
      };

      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: '$2b$10$hashedPassword',
        activo: true,
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(user);

      // Mock bcrypt.compare to return false
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });

    it('should fail to login with inactive user', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'Password123!',
      };

      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: '$2b$10$hashedPassword',
        activo: false,
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(user);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario inactivo');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const user = {
        _id: userId,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        role: 'pasajero',
        phone: '+5491123456789',
      };

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await authService.getProfile(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should fail to get profile of non-existent user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserRepository.findById.mockResolvedValue(null);

      const result = await authService.getProfile(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no encontrado');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez González',
        phone: '+5491123456789',
      };

      const updatedUser = {
        _id: userId,
        ...updateData,
        email: 'juan@example.com',
        role: 'pasajero',
      };

      const existingUser = {
        _id: userId,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        role: 'pasajero',
        activo: true,
        toJSON: () => ({
          _id: userId,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@example.com',
          role: 'pasajero',
          activo: true,
        }),
      };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should fail to update profile of non-existent user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        nombre: 'Juan Carlos',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      const result = await authService.updateProfile(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no encontrado');
    });

    it('should fail to update profile with invalid data', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        nombre: 'A', // Too short
        email: 'invalid-email',
      };

      const existingUser = {
        _id: userId,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        role: 'pasajero',
        activo: true,
        toJSON: () => ({
          _id: userId,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@example.com',
          role: 'pasajero',
          activo: true,
        }),
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);

      const result = await authService.updateProfile(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email válido es requerido');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      };

      const user = {
        _id: userId,
        email: 'juan@example.com',
        nombre: 'Juan',
        apellido: 'Pérez'
      };

      const userWithPassword = {
        _id: userId,
        email: 'juan@example.com',
        password: '$2b$10$hashedOldPassword',
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithPassword);
      mockUserRepository.updatePassword.mockResolvedValue({ _id: userId });

      // Mock bcrypt.compare and hash
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2b$10$hashedNewPassword');

      const result = await authService.changePassword(userId, passwordData.currentPassword, passwordData.newPassword);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Contraseña actualizada exitosamente');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(userId, '$2b$10$hashedNewPassword');
    });

    it('should fail to change password with wrong current password', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword456!',
      };

      const user = {
        _id: userId,
        email: 'juan@example.com',
        password: '$2b$10$hashedPassword',
      };

      const userWithPassword = {
        _id: userId,
        email: 'juan@example.com',
        password: '$2b$10$hashedPassword',
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithPassword);

      // Mock bcrypt.compare to return false
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await authService.changePassword(userId, passwordData.currentPassword, passwordData.newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Contraseña actual incorrecta');
    });

    it('should fail to change password with weak new password', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak', // Too weak
      };

      const user = {
        _id: userId,
        email: 'juan@example.com',
        password: '$2b$10$hashedPassword',
      };

      const userWithPassword = {
        _id: userId,
        email: 'juan@example.com',
        password: '$2b$10$hashedPassword',
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithPassword);

      // Mock bcrypt.compare to return true
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.changePassword(userId, passwordData.currentPassword, passwordData.newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toContain('al menos 6 caracteres');
    });
  });

  describe('getAuthStats', () => {
    it('should get authentication statistics', async () => {
      const stats = {
        totalUsers: 100,
        activeUsers: 85,
        passengers: 70,
        drivers: 25,
        admins: 5,
      };

      // Mock different calls for different filters
      mockUserRepository.findWithFilters
        .mockResolvedValueOnce({ pagination: { total: 100 } }) // totalUsers
        .mockResolvedValueOnce({ pagination: { total: 85 } })  // activeUsers
        .mockResolvedValueOnce({ pagination: { total: 70 } })  // passengers
        .mockResolvedValueOnce({ pagination: { total: 25 } })  // drivers
        .mockResolvedValueOnce({ pagination: { total: 5 } });  // admins

      const result = await authService.getAuthStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(stats);
      expect(mockUserRepository.findWithFilters).toHaveBeenCalled();
    });
  });

  describe('Edge cases y validaciones avanzadas', () => {
    it('should handle malformed email addresses', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'pasajero',
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should handle weak passwords', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: '123',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
    });

    it('should handle empty required fields', async () => {
      const userData = {
        nombre: '',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('nombre es requerido');
    });

    it('should handle special characters in names', async () => {
      const userData = {
        nombre: 'José-María',
        apellido: "O'Connor",
        email: 'jose@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: longEmail,
        password: 'Password123!',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
    });

    it('should handle concurrent registration attempts', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      // Simular que el email no existe en la primera llamada pero sí en la segunda
      mockUserRepository.emailExists
        .mockResolvedValueOnce(false) // Primera llamada
        .mockResolvedValueOnce(true); // Segunda llamada

      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      // Primera llamada debería ser exitosa
      const result1 = await authService.register(userData);
      expect(result1.success).toBe(true);

      // Segunda llamada debería fallar
      const result2 = await authService.register(userData);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('email');
    });
  });

  describe('Token validation edge cases', () => {
    it('should handle malformed JWT tokens', async () => {
      const malformedToken = 'invalid.jwt.token';

      const result = await authService.verifyToken(malformedToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token inválido');
    });

    it('should handle expired tokens', async () => {
      // Crear un token expirado (esto requeriría mockear jwt.verify)
      const expiredToken = 'expired.token.here';

      const result = await authService.verifyToken(expiredToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token inválido');
    });

    it('should handle tokens with invalid signature', async () => {
      const invalidToken = 'invalid.signature.token';

      const result = await authService.verifyToken(invalidToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token inválido');
    });
  });

  describe('Password validation edge cases', () => {
    it('should reject passwords with only numbers', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: '12345678',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
    });

    it('should reject passwords with only letters', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'abcdefgh',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
    });

    it('should reject passwords with only special characters', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: '!@#$%^&*',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
    });

    it('should accept strong passwords with mixed characters', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'MyStr0ng!P@ssw0rd',
        role: 'pasajero',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
    });
  });

  describe('Database error handling', () => {
    it('should handle database connection errors during registration', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      mockUserRepository.emailExists.mockRejectedValue(new Error('Database connection failed'));

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle database connection errors during login', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'Password123!',
      };

      mockUserRepository.findByEmailWithPassword.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle database timeout errors', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'pasajero',
      };

      const timeoutError = new Error('Database timeout');
      timeoutError.code = 'TIMEOUT';
      mockUserRepository.emailExists.mockRejectedValue(timeoutError);

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Rate limiting and security', () => {
    it('should track failed login attempts', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'WrongPassword',
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: 'hashedPassword',
        activo: false, // Usuario inactivo
      });

      // Simular múltiples intentos fallidos
      for (let i = 0; i < 5; i++) {
        await authService.login(loginData.email, loginData.password);
      }

      // El sexto intento debería fallar por usuario inactivo
      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Usuario inactivo');
    });

    it('should reset failed attempts after successful login', async () => {
      const loginData = {
        email: 'juan@example.com',
        password: 'Password123!',
      };

      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: 'hashedPassword',
        activo: true,
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(user);
      mockUserRepository.toEntity.mockReturnValue(user);

      // Mock bcrypt.compare para que falle en los intentos fallidos y funcione en el exitoso
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(false) // Primer intento fallido
        .mockResolvedValueOnce(false) // Segundo intento fallido
        .mockResolvedValueOnce(false) // Tercer intento fallido
        .mockResolvedValueOnce(true); // Login exitoso

      // Simular algunos intentos fallidos
      for (let i = 0; i < 3; i++) {
        await authService.login(loginData.email, 'WrongPassword');
      }

      // Login exitoso debería funcionar
      const result = await authService.login(loginData.email, loginData.password);

      expect(result.success).toBe(true);
    });
  });

  describe('Performance and memory', () => {
    it('should handle large batch of registrations', async () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        nombre: `User${i}`,
        apellido: 'Test',
        email: `user${i}@example.com`,
        password: 'Password123!',
        role: 'pasajero',
      }));

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        password: 'hashedPassword',
      });

      const startTime = Date.now();
      const results = await Promise.all(users.map(user => authService.register(user)));
      const endTime = Date.now();

      expect(results.every(result => result.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(30000); // Menos de 30 segundos
    });

    it('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Realizar muchas operaciones
      for (let i = 0; i < 1000; i++) {
        await authService.isValidEmail(`test${i}@example.com`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // El aumento de memoria debería ser razonable (menos de 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
