// Tests unitarios sin base de datos
const { AuthService } = require('../../src/business/AuthService');
const { TripService } = require('../../src/business/TripService');

// Mock de los repositories
const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  emailExists: jest.fn()
};

const mockTripRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPassengerId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findActiveTrips: jest.fn()
};

describe('Unit Tests - Services', () => {
  let authService;
  let tripService;

  beforeEach(() => {
    authService = new AuthService(mockUserRepository);
    tripService = new TripService(mockTripRepository, mockUserRepository);
    jest.clearAllMocks();
  });

  describe('AuthService', () => {
    it('should validate email format correctly', () => {
      expect(authService.isValidEmail('test@example.com')).toBe(true);
      expect(authService.isValidEmail('invalid-email')).toBe(false);
    });

    it('should validate password strength correctly', () => {
      expect(authService.isValidPassword('Password123!')).toBe(true);
      expect(authService.isValidPassword('weak')).toBe(false);
    });

    it('should generate verification code', () => {
      const code = authService.generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('TripService', () => {
    it('should validate status transitions correctly', () => {
      expect(tripService.isValidStatusTransition('requested', 'accepted')).toBe(true);
      expect(tripService.isValidStatusTransition('requested', 'completed')).toBe(false);
      expect(tripService.isValidStatusTransition('completed', 'cancelled')).toBe(false);
    });

    it('should check user access to trip correctly', () => {
      const trip = {
        passengerId: 'user1',
        driverId: 'driver1'
      };

      expect(tripService.canUserAccessTrip(trip, 'user1', 'pasajero')).toBe(true);
      expect(tripService.canUserAccessTrip(trip, 'driver1', 'conductor')).toBe(true);
      expect(tripService.canUserAccessTrip(trip, 'user2', 'pasajero')).toBe(false);
    });
  });
});
