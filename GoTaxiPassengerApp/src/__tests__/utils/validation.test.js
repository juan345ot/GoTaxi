import {
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  isValidCoordinates,
  validateUserRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateTripRequest,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    it('should sanitize basic HTML characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should remove control characters', () => {
      expect(sanitizeString('hello\x00world')).toBe('helloworld');
    });

    it('should limit string length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString).length).toBe(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize nested object strings', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        nested: {
          value: 'hello\x00world',
        },
      };

      const result = sanitizeObject(input);
      expect(result.name).toBe('scriptalert("xss")/script');
      expect(result.email).toBe('test@example.com');
      expect(result.nested.value).toBe('helloworld');
    });

    it('should handle non-object input', () => {
      expect(sanitizeObject('string')).toBe('string');
      expect(sanitizeObject(null)).toBe(null);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });

    it('should reject emails longer than 254 characters', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('MyStr0ng@Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isValidPassword('password')).toBe(false);
      expect(isValidPassword('12345678')).toBe(false);
      expect(isValidPassword('PASSWORD')).toBe(false);
      expect(isValidPassword('Password')).toBe(false);
      expect(isValidPassword('Password123')).toBe(false);
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+54 11 1234-5678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(isValidName('Juan')).toBe(true);
      expect(isValidName('María José')).toBe(true);
      expect(isValidName('José María')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('J')).toBe(false);
      expect(isValidName('John123')).toBe(false);
      expect(isValidName('John@Doe')).toBe(false);
      expect(isValidName('')).toBe(false);
      expect(isValidName(null)).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(40.7128, -74.006)).toBe(true);
      expect(isValidCoordinates(-34.6037, -58.3816)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
      expect(isValidCoordinates('invalid', 'invalid')).toBe(false);
    });
  });

  describe('validateUserRegistration', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        phone: '+1234567890',
      };

      const result = validateUserRegistration(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid registration data', () => {
      const invalidData = {
        name: 'J',
        lastname: 'Pérez',
        email: 'invalid-email',
        password: 'weak',
        phone: '123',
      };

      const result = validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validateLogin(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const result = validateLogin(invalidData);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateProfileUpdate', () => {
    it('should validate correct profile data', () => {
      const validData = {
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        phone: '+1234567890',
      };

      const result = validateProfileUpdate(validData);
      expect(result.isValid).toBe(true);
    });

    it('should allow partial updates', () => {
      const partialData = {
        name: 'Juan',
      };

      const result = validateProfileUpdate(partialData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePasswordChange', () => {
    it('should validate correct password change', () => {
      const validData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const result = validatePasswordChange(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const result = validatePasswordChange(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Las contraseñas no coinciden');
    });

    it('should reject same current and new password', () => {
      const invalidData = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      };

      const result = validatePasswordChange(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La nueva contraseña debe ser diferente a la actual');
    });
  });

  describe('validateTripRequest', () => {
    it('should validate correct trip data', () => {
      const validData = {
        origin: {
          address: 'Origen 123',
          lat: 40.7128,
          lng: -74.006,
        },
        destination: {
          address: 'Destino 456',
          lat: 40.7589,
          lng: -73.9851,
        },
        paymentMethod: 'cash',
      };

      const result = validateTripRequest(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid trip data', () => {
      const invalidData = {
        origin: {
          address: '',
          lat: 91,
          lng: 0,
        },
        destination: {
          address: 'Destino 456',
          lat: 40.7589,
          lng: -73.9851,
        },
        paymentMethod: '',
      };

      const result = validateTripRequest(invalidData);
      expect(result.isValid).toBe(false);
    });
  });
});
