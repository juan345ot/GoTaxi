import TripService from '../../services/TripService';
import TripRepository from '../../infrastructure/repositories/TripRepository';
import Trip from '../../domain/entities/Trip';
import secureStorage from '../../utils/secureStorage';

// Mock de las dependencias
jest.mock('../../infrastructure/repositories/TripRepository');
jest.mock('../../domain/entities/Trip');
jest.mock('../../utils/secureStorage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn().mockResolvedValue(true),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(true),
  },
}));

describe('TripService', () => {
  let tripService;
  let mockTripRepository;

  beforeEach(() => {
    mockTripRepository = {
      requestRide: jest.fn(),
      getTripById: jest.fn(),
      cancelTrip: jest.fn(),
      payTrip: jest.fn(),
      rateTrip: jest.fn(),
      getUserTrips: jest.fn(),
      getActiveTrip: jest.fn(),
      getTripsByStatus: jest.fn(),
    };

    TripRepository.mockImplementation(() => mockTripRepository);
    tripService = new TripService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(tripService.offlineQueue).toEqual([]);
      expect(tripService.isOnline).toBe(true);
      expect(tripService.maxRetries).toBe(3);
      expect(tripService.retryDelay).toBe(1000);
      expect(tripService.syncInterval).toBe(30000);
    });
  });

  describe('requestTrip', () => {
    const validOrigin = {
      address: 'Av. Corrientes 123',
      latitude: -34.6037,
      longitude: -58.3816,
    };

    const validDestination = {
      address: 'Plaza de Mayo',
      latitude: -34.6083,
      longitude: -58.3712,
    };

    const validPaymentMethod = 'credit_card';

    it('should request trip successfully when online', async() => {
      const mockTrip = {
        id: 'trip_123',
        origin: validOrigin,
        destination: validDestination,
        paymentMethod: validPaymentMethod,
        status: 'requested',
        canBeCancelled: () => true,
        canBeRated: () => false,
        validate: () => ({ isValid: true, errors: [] }),
      };

      const mockResult = {
        success: true,
        data: mockTrip,
      };

      Trip.mockImplementation(() => mockTrip);
      mockTripRepository.requestRide.mockResolvedValue(mockResult);

      const result = await tripService.requestTrip(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrip);
      expect(result.message).toBe('Viaje solicitado exitosamente');
      expect(mockTripRepository.requestRide).toHaveBeenCalledWith(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );
    });

    it('should save trip to offline queue when offline', async() => {
      tripService.isOnline = false;

      const mockTrip = {
        validate: () => ({ isValid: true, errors: [] }),
      };

      Trip.mockImplementation(() => mockTrip);

      const result = await tripService.requestTrip(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );

      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);
      expect(result.message).toContain('Solicitud guardada para sincronizar');
      expect(tripService.offlineQueue).toHaveLength(1);
      expect(tripService.offlineQueue[0].type).toBe('requestTrip');
    });

    it('should validate trip request data', async() => {
      const invalidOrigin = { address: '' };
      const invalidDestination = { address: '' };

      const result = await tripService.requestTrip(invalidOrigin, invalidDestination, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('El origen es requerido');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent same origin and destination', async() => {
      const sameLocation = { address: 'Same Address' };

      const result = await tripService.requestTrip(sameLocation, sameLocation, validPaymentMethod);

      expect(result.success).toBe(false);
      expect(result.error).toContain('El origen y destino no pueden ser iguales');
    });

    it('should handle repository errors and save offline', async() => {
      const networkError = new Error('Network error');
      networkError.code = 'NETWORK_ERROR';

      const mockTrip = {
        validate: () => ({ isValid: true, errors: [] }),
      };

      Trip.mockImplementation(() => mockTrip);
      mockTripRepository.requestRide.mockRejectedValue(networkError);

      const result = await tripService.requestTrip(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );

      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);
      expect(tripService.offlineQueue).toHaveLength(1);
    });

    it('should calculate estimated fare', async() => {
      const mockTripData = {
        id: 'trip_123',
        fare: 150,
        validate: () => ({ isValid: true, errors: [] }),
      };

      Trip.mockImplementation(() => mockTripData);
      mockTripRepository.requestRide.mockResolvedValue({ success: true, data: mockTripData });

      const result = await tripService.requestTrip(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // El fare se calcula internamente y se incluye en tripData antes de crear el Trip
      expect(typeof tripService.calculateEstimatedFare(validOrigin, validDestination)).toBe('number');
    });
  });

  describe('getTripById', () => {
    it('should get trip by ID successfully', async() => {
      const tripId = 'trip_123';
      const mockTrip = { id: tripId, status: 'completed' };

      const mockResult = {
        success: true,
        data: mockTrip,
      };

      mockTripRepository.getTripById.mockResolvedValue(mockResult);

      const result = await tripService.getTripById(tripId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrip);
      expect(mockTripRepository.getTripById).toHaveBeenCalledWith(tripId);
    });

    it('should handle missing trip ID', async() => {
      const result = await tripService.getTripById('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de viaje requerido');
    });

    it('should handle repository errors', async() => {
      const tripId = 'trip_123';
      mockTripRepository.getTripById.mockResolvedValue({
        success: false,
        error: 'Trip not found',
      });

      const result = await tripService.getTripById(tripId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Trip not found');
    });
  });

  describe('cancelTrip', () => {
    const tripId = 'trip_123';

    it('should cancel trip successfully when online', async() => {
      const mockTrip = {
        id: tripId,
        status: 'requested',
        canBeCancelled: () => true,
      };

      const mockResult = {
        success: true,
        data: mockTrip,
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });
      mockTripRepository.cancelTrip.mockResolvedValue(mockResult);

      const result = await tripService.cancelTrip(tripId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Viaje cancelado exitosamente');
      expect(mockTripRepository.cancelTrip).toHaveBeenCalledWith(tripId);
    });

    it('should save cancellation to offline queue when offline', async() => {
      tripService.isOnline = false;

      const mockTrip = {
        id: tripId,
        status: 'requested',
        canBeCancelled: () => true,
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });

      const result = await tripService.cancelTrip(tripId);

      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);
      expect(result.message).toContain('Cancelación guardada para sincronizar');
      expect(tripService.offlineQueue).toHaveLength(1);
      expect(tripService.offlineQueue[0].type).toBe('cancelTrip');
    });

    it('should prevent cancellation of non-cancellable trips', async() => {
      const mockTrip = {
        id: tripId,
        status: 'in_progress',
        canBeCancelled: () => false,
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });

      const result = await tripService.cancelTrip(tripId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Este viaje no puede ser cancelado');
    });

    it('should handle missing trip ID', async() => {
      const result = await tripService.cancelTrip('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de viaje requerido');
    });
  });

  describe('payTrip', () => {
    const tripId = 'trip_123';
    const paymentMethod = 'credit_card';

    it('should pay trip successfully when online', async() => {
      const mockResult = {
        success: true,
        data: { id: tripId, paymentStatus: 'completed' },
      };

      mockTripRepository.payTrip.mockResolvedValue(mockResult);

      const result = await tripService.payTrip(tripId, paymentMethod);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Pago procesado exitosamente');
      expect(mockTripRepository.payTrip).toHaveBeenCalledWith(tripId, paymentMethod);
    });

    it('should save payment to offline queue when offline', async() => {
      tripService.isOnline = false;

      const result = await tripService.payTrip(tripId, paymentMethod);

      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);
      expect(result.message).toContain('Pago guardado para sincronizar');
      expect(tripService.offlineQueue).toHaveLength(1);
      expect(tripService.offlineQueue[0].type).toBe('payTrip');
    });

    it('should handle missing trip ID', async() => {
      const result = await tripService.payTrip('', paymentMethod);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de viaje requerido');
    });

    it('should handle missing payment method', async() => {
      const result = await tripService.payTrip(tripId, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Método de pago requerido');
    });
  });

  describe('rateTrip', () => {
    const tripId = 'trip_123';
    const rating = 5;
    const comment = 'Excellent service';

    it('should rate trip successfully when online', async() => {
      const mockTrip = {
        id: tripId,
        status: 'completed',
        canBeRated: () => true,
      };

      const mockResult = {
        success: true,
        data: { id: tripId, rating, comment },
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });
      mockTripRepository.rateTrip.mockResolvedValue(mockResult);

      const result = await tripService.rateTrip(tripId, rating, comment);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Viaje calificado exitosamente');
      expect(mockTripRepository.rateTrip).toHaveBeenCalledWith(tripId, rating, comment);
    });

    it('should save rating to offline queue when offline', async() => {
      tripService.isOnline = false;

      const mockTrip = {
        id: tripId,
        status: 'completed',
        canBeRated: () => true,
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });

      const result = await tripService.rateTrip(tripId, rating, comment);

      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);
      expect(result.message).toContain('Calificación guardada para sincronizar');
      expect(tripService.offlineQueue).toHaveLength(1);
      expect(tripService.offlineQueue[0].type).toBe('rateTrip');
    });

    it('should validate rating range', async() => {
      const result = await tripService.rateTrip(tripId, 6, comment);

      expect(result.success).toBe(false);
      expect(result.error).toContain('La calificación debe estar entre 1 y 5');
    });

    it('should prevent rating of non-rateable trips', async() => {
      const mockTrip = {
        id: tripId,
        status: 'requested',
        canBeRated: () => false,
      };

      mockTripRepository.getTripById.mockResolvedValue({ success: true, data: mockTrip });

      const result = await tripService.rateTrip(tripId, rating, comment);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Este viaje no puede ser calificado');
    });
  });

  describe('getUserTrips', () => {
    it('should get user trips successfully', async() => {
      const mockTrips = [
        { id: 'trip_1', status: 'completed' },
        { id: 'trip_2', status: 'cancelled' },
      ];

      const mockResult = {
        success: true,
        data: mockTrips,
      };

      mockTripRepository.getUserTrips.mockResolvedValue(mockResult);

      const result = await tripService.getUserTrips();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrips);
      expect(mockTripRepository.getUserTrips).toHaveBeenCalled();
    });

    it('should handle repository errors', async() => {
      mockTripRepository.getUserTrips.mockResolvedValue({
        success: false,
        error: 'Failed to fetch trips',
      });

      const result = await tripService.getUserTrips();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch trips');
    });
  });

  describe('getActiveTrip', () => {
    it('should get active trip successfully', async() => {
      const mockActiveTrip = { id: 'trip_123', status: 'in_progress' };

      const mockResult = {
        success: true,
        data: mockActiveTrip,
      };

      mockTripRepository.getActiveTrip.mockResolvedValue(mockResult);

      const result = await tripService.getActiveTrip();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockActiveTrip);
      expect(mockTripRepository.getActiveTrip).toHaveBeenCalled();
    });

    it('should return null when no active trip', async() => {
      const mockResult = {
        success: true,
        data: null,
      };

      mockTripRepository.getActiveTrip.mockResolvedValue(mockResult);

      const result = await tripService.getActiveTrip();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('getTripsByStatus', () => {
    it('should get trips by status successfully', async() => {
      const status = 'completed';
      const mockTrips = [
        { id: 'trip_1', status: 'completed' },
        { id: 'trip_2', status: 'completed' },
      ];

      const mockResult = {
        success: true,
        data: mockTrips,
      };

      mockTripRepository.getTripsByStatus.mockResolvedValue(mockResult);

      const result = await tripService.getTripsByStatus(status);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrips);
      expect(mockTripRepository.getTripsByStatus).toHaveBeenCalledWith(status);
    });
  });

  describe('validation methods', () => {
    it('should validate trip request correctly', () => {
      const validOrigin = { address: 'Origin Address' };
      const validDestination = { address: 'Destination Address' };
      const validPaymentMethod = 'credit_card';

      const result = tripService.validateTripRequest(
        validOrigin,
        validDestination,
        validPaymentMethod,
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid trip request', () => {
      const invalidOrigin = { address: '' };
      const invalidDestination = { address: '' };
      const invalidPaymentMethod = '';

      const result = tripService.validateTripRequest(
        invalidOrigin,
        invalidDestination,
        invalidPaymentMethod,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El origen es requerido');
      expect(result.errors).toContain('El destino es requerido');
      expect(result.errors).toContain('El método de pago es requerido');
    });
  });

  describe('fare calculation', () => {
    it('should calculate estimated fare', () => {
      const origin = { latitude: -34.6037, longitude: -58.3816 };
      const destination = { latitude: -34.6083, longitude: -58.3712 };

      const fare = tripService.calculateEstimatedFare(origin, destination);

      expect(typeof fare).toBe('number');
      expect(fare).toBeGreaterThan(0);
    });

    it('should calculate distance between points', () => {
      const distance = tripService.calculateDistance();

      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    });

    it('should calculate estimated duration', () => {
      const origin = { latitude: -34.6037, longitude: -58.3816 };
      const destination = { latitude: -34.6083, longitude: -58.3712 };

      const duration = tripService.getEstimatedDuration(origin, destination);

      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('offline functionality', () => {
    it('should add operation to offline queue', () => {
      const operation = {
        type: 'requestTrip',
        data: { origin: {}, destination: {}, paymentMethod: 'credit_card' },
      };

      tripService.addToOfflineQueue(operation);

      expect(tripService.offlineQueue).toHaveLength(1);
      expect(tripService.offlineQueue[0].type).toBe('requestTrip');
      expect(tripService.offlineQueue[0].timestamp).toBeDefined();
    });

    it('should process offline queue when online', async() => {
      tripService.isOnline = true;
      tripService.offlineQueue = [
        {
          type: 'requestTrip',
          data: { origin: {}, destination: {}, paymentMethod: 'credit_card' },
        },
      ];

      mockTripRepository.requestRide.mockResolvedValue({ success: true, data: {} });

      await tripService.processOfflineQueue();

      expect(tripService.offlineQueue).toHaveLength(0);
      expect(mockTripRepository.requestRide).toHaveBeenCalled();
    });

    it('should save and load offline queue', async() => {
      const operation = {
        type: 'requestTrip',
        data: { origin: {}, destination: {}, paymentMethod: 'credit_card' },
      };

      tripService.addToOfflineQueue(operation);

      expect(secureStorage.setItem).toHaveBeenCalledWith('offline_trip_queue', expect.any(Array));
    });

    it('should get sync status', () => {
      tripService.offlineQueue = [{ type: 'test' }];
      tripService.lastSyncTime = new Date();

      const status = tripService.getSyncStatus();

      expect(status.isOnline).toBe(true);
      expect(status.pendingOperations).toBe(1);
      expect(status.lastSync).toBeDefined();
    });

    it('should sync pending data when online', async() => {
      tripService.isOnline = true;
      tripService.offlineQueue = [
        {
          type: 'requestTrip',
          data: { origin: {}, destination: {}, paymentMethod: 'credit_card' },
        },
      ];

      mockTripRepository.requestRide.mockResolvedValue({ success: true, data: {} });

      const result = await tripService.syncPendingData();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Datos sincronizados exitosamente');
    });

    it('should handle sync when offline', async() => {
      tripService.isOnline = false;

      const result = await tripService.syncPendingData();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sin conexión a internet');
    });
  });

  describe('cache functionality', () => {
    it('should get user trips with cache', async() => {
      const mockTrips = [{ id: 'trip_1' }];
      secureStorage.getItem.mockResolvedValue(mockTrips);
      tripService.isOnline = true;

      const result = await tripService.getUserTripsWithCache();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrips);
      expect(result.fromCache).toBe(true);
    });

    it('should update trips in background', async() => {
      const mockTrips = [{ id: 'trip_1' }];
      mockTripRepository.getUserTrips.mockResolvedValue({ success: true, data: mockTrips });

      await tripService.updateTripsInBackground();

      expect(mockTripRepository.getUserTrips).toHaveBeenCalled();
      expect(secureStorage.setItem).toHaveBeenCalledWith('user_trips', mockTrips);
    });
  });

  describe('utility methods', () => {
    it('should check if user has active trip', async() => {
      mockTripRepository.getActiveTrip.mockResolvedValue({ success: true, data: { id: 'trip_1' } });

      const hasActive = await tripService.hasActiveTrip();

      expect(hasActive).toBe(true);
    });

    it('should return false when no active trip', async() => {
      mockTripRepository.getActiveTrip.mockResolvedValue({ success: true, data: null });

      const hasActive = await tripService.hasActiveTrip();

      expect(hasActive).toBe(false);
    });

    it('should create delay', async() => {
      const start = Date.now();
      await tripService.delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });
});
