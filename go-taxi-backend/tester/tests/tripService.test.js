const { TripService } = require('../../src/business/TripService');
const { TripRepository } = require('../../src/repositories/TripRepository');
const { UserRepository } = require('../../src/repositories/UserRepository');
const { cleanDB } = require('../utils/cleanDB');

// Mock de los repositories
jest.mock('../../src/repositories/TripRepository');
jest.mock('../../src/repositories/UserRepository');
jest.mock('../../src/models/Driver');

describe('TripService', () => {
  let tripService;
  let mockTripRepository;
  let mockUserRepository;

  beforeEach(() => {
    mockTripRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPassengerId: jest.fn(),
      findByDriverId: jest.fn(),
      findByStatus: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findActiveTrips: jest.fn(),
      findByDateRange: jest.fn(),
      findByStatuses: jest.fn(),
      findNearbyTrips: jest.fn(),
      getTripStats: jest.fn(),
      findWithAdvancedFilters: jest.fn(),
      findWithCursor: jest.fn(),
      toEntity: jest.fn(trip => ({
        id: trip._id,
        passengerId: trip.passengerId,
        driverId: trip.driverId,
        origin: trip.origin,
        destination: trip.destination,
        status: trip.status,
        fare: trip.fare,
        distance: trip.distance,
        duration: trip.duration,
        paymentMethod: trip.paymentMethod,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      })),
    };

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findByRole: jest.fn(),
      findActiveDrivers: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn(),
      emailExists: jest.fn(),
      findWithFilters: jest.fn(),
      findByIds: jest.fn(),
      findAvailableDrivers: jest.fn(),
      getUserStats: jest.fn(),
      findWithCursor: jest.fn(),
      toEntity: jest.fn(user => ({
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };

    tripService = new TripService();
    tripService.tripRepository = mockTripRepository;
    tripService.userRepository = mockUserRepository;

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanDB();
  });

  describe('createTrip', () => {
    it('should create a new trip successfully', async () => {
      const tripData = {
        passengerId: '507f1f77bcf86cd799439011',
        origin: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816,
        },
        destination: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974,
        },
        fare: 1500,
        distance: 5.2,
        duration: 15,
        paymentMethod: 'cash',
      };

      const createdTrip = {
        _id: '507f1f77bcf86cd799439012',
        ...tripData,
        status: 'requested',
        createdAt: new Date(),
      };

      const passenger = {
        _id: tripData.passengerId,
        role: 'pasajero',
        isActive: true,
        canPerformActions: () => true,
      };
      mockUserRepository.findById.mockResolvedValue(passenger);
      mockTripRepository.create.mockResolvedValue(createdTrip);

      const result = await tripService.createTrip(tripData, tripData.passengerId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdTrip);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(tripData.passengerId);
      expect(mockTripRepository.create).toHaveBeenCalled();
    });

    it('should fail to create trip with non-existent passenger', async () => {
      const tripData = {
        passengerId: '507f1f77bcf86cd799439011',
        origin: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816,
        },
        destination: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974,
        },
        fare: 1500,
        paymentMethod: 'cash',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      const result = await tripService.createTrip(tripData, tripData.passengerId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pasajero no encontrado');
      expect(mockTripRepository.create).not.toHaveBeenCalled();
    });

    it('should fail to create trip with inactive passenger', async () => {
      const tripData = {
        passengerId: '507f1f77bcf86cd799439011',
        origin: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816,
        },
        destination: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974,
        },
        fare: 1500,
        paymentMethod: 'cash',
      };

      const passenger = {
        _id: tripData.passengerId,
        role: 'pasajero',
        isActive: false,
        canPerformActions: () => false,
      };
      mockUserRepository.findById.mockResolvedValue(passenger);

      const result = await tripService.createTrip(tripData, tripData.passengerId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pasajero inactivo');
      expect(mockTripRepository.create).not.toHaveBeenCalled();
    });

    it('should fail to create trip with invalid data', async () => {
      const tripData = {
        passengerId: '507f1f77bcf86cd799439011',
        origin: {
          address: 'Av. Corrientes 1234, Buenos Aires',
          // Missing coordinates
        },
        destination: {
          address: 'Av. Santa Fe 5678, Buenos Aires',
          // Missing coordinates
        },
        // Missing required fields: fare, paymentMethod
      };

      const passenger = {
        _id: tripData.passengerId,
        role: 'pasajero',
        isActive: true,
        canPerformActions: () => true,
      };
      mockUserRepository.findById.mockResolvedValue(passenger);

      const result = await tripService.createTrip(tripData, tripData.passengerId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Datos inválidos');
      expect(mockTripRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('assignDriver', () => {
    it('should assign driver to trip successfully', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const driverId = '507f1f77bcf86cd799439013';
      const adminId = '507f1f77bcf86cd799439014';

      const trip = {
        _id: tripId,
        passengerId: '507f1f77bcf86cd799439011',
        status: 'requested',
      };

      const driver = {
        _id: driverId,
        role: 'conductor',
        isActive: true,
        isDriver: () => true,
        canPerformActions: () => true,
      };

      const admin = {
        _id: adminId,
        role: 'admin',
        isActive: true,
      };

      // Mock del Driver document
      const Driver = require('../../src/models/Driver');
      const mockDriverDoc = { _id: 'driver-doc-id', user: driverId, toString: () => 'driver-doc-id' };
      Driver.findOne = jest.fn().mockResolvedValue(mockDriverDoc);
      Driver.findById = jest.fn().mockResolvedValue(mockDriverDoc);

      const updatedTrip = {
        ...trip,
        driverId: 'driver-doc-id', // El ID del Driver document que se guarda
        status: 'accepted',
        assignedAt: new Date(),
      };

      mockTripRepository.findById.mockResolvedValue(trip);
      mockUserRepository.findById.mockResolvedValue(driver);
      mockTripRepository.update.mockResolvedValue(updatedTrip);

      const result = await tripService.assignDriver(tripId, driverId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Después de la corrección en TripService, driverId debe ser el ID del User
      expect(result.data.driverId).toBe(driverId);
      expect(mockTripRepository.update).toHaveBeenCalled();
    });

    it('should fail to assign driver to non-existent trip', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const driverId = '507f1f77bcf86cd799439013';
      const adminId = '507f1f77bcf86cd799439014';

      mockTripRepository.findById.mockResolvedValue(null);

      const result = await tripService.assignDriver(tripId, driverId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Viaje no encontrado');
    });

    it('should fail to assign driver to trip with invalid status', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const driverId = '507f1f77bcf86cd799439013';
      const adminId = '507f1f77bcf86cd799439014';

      const trip = {
        _id: tripId,
        status: 'completed', // Already completed
      };

      mockTripRepository.findById.mockResolvedValue(trip);

      const result = await tripService.assignDriver(tripId, driverId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El viaje no está en estado solicitado para asignar conductor');
    });

    it('should fail to assign non-existent driver', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const driverId = '507f1f77bcf86cd799439013';
      const adminId = '507f1f77bcf86cd799439014';

      const trip = {
        _id: tripId,
        status: 'requested',
      };

      mockTripRepository.findById.mockResolvedValue(trip);
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await tripService.assignDriver(tripId, driverId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Conductor no encontrado');
    });

    it('should fail to assign inactive driver', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const driverId = '507f1f77bcf86cd799439013';
      const adminId = '507f1f77bcf86cd799439014';

      const trip = {
        _id: tripId,
        status: 'requested',
      };

      const driver = {
        _id: driverId,
        role: 'conductor',
        isActive: false,
        isDriver: () => true,
        canPerformActions: () => false,
      };

      mockTripRepository.findById.mockResolvedValue(trip);
      mockUserRepository.findById.mockResolvedValue(driver);

      const result = await tripService.assignDriver(tripId, driverId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Conductor inactivo');
    });
  });

  describe('updateTripStatus', () => {
    it('should update trip status successfully', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const status = 'driver_arrived';
      const userId = '507f1f77bcf86cd799439011';

      const trip = {
        _id: tripId,
        status: 'accepted',
        passengerId: userId,
      };

      const updatedTrip = {
        ...trip,
        status,
        updatedAt: new Date(),
      };

      mockTripRepository.findById.mockResolvedValue(trip);
      mockTripRepository.update.mockResolvedValue(updatedTrip);

      const result = await tripService.updateTripStatus(tripId, status, userId, 'pasajero');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedTrip);
      expect(mockTripRepository.update).toHaveBeenCalledWith(tripId, {
        status,
        updatedAt: expect.any(Date),
        driverArrivedAt: expect.any(Date),
      });
    });

    it('should fail to update status of non-existent trip', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const status = 'in_progress';
      const userId = '507f1f77bcf86cd799439011';

      mockTripRepository.findById.mockResolvedValue(null);

      const result = await tripService.updateTripStatus(tripId, status, userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Viaje no encontrado');
    });

    it('should fail to update status with invalid transition', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const status = 'completed';
      const userId = '507f1f77bcf86cd799439011';

      const trip = {
        _id: tripId,
        status: 'requested', // Cannot go directly from requested to completed
        passengerId: userId,
      };

      mockTripRepository.findById.mockResolvedValue(trip);

      const result = await tripService.updateTripStatus(tripId, status, userId, 'pasajero');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se puede cambiar de requested a completed');
    });
  });

  describe('getTripById', () => {
    it('should get trip by id successfully', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const trip = {
        _id: tripId,
        passengerId: '507f1f77bcf86cd799439011',
        status: 'requested',
      };

      mockTripRepository.findById.mockResolvedValue(trip);

      const result = await tripService.getTripById(tripId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(trip);
      expect(mockTripRepository.findById).toHaveBeenCalledWith(tripId);
    });

    it('should fail to get non-existent trip', async () => {
      const tripId = '507f1f77bcf86cd799439012';

      mockTripRepository.findById.mockResolvedValue(null);

      const result = await tripService.getTripById(tripId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Viaje no encontrado');
    });
  });

  describe('getUserTrips', () => {
    it('should get user trips successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const trips = [
        { _id: '507f1f77bcf86cd799439012', passengerId: userId, status: 'completed' },
        { _id: '507f1f77bcf86cd799439013', passengerId: userId, status: 'requested' },
      ];

      mockTripRepository.findByPassengerId.mockResolvedValue({
        trips,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      const result = await tripService.getUserTrips(userId, 'pasajero', { page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(trips);
      expect(mockTripRepository.findByPassengerId).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
      });
    });
  });

  describe('cancelTrip', () => {
    it('should cancel trip successfully', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const userId = '507f1f77bcf86cd799439011';
      const reason = 'Cambio de planes';

      const trip = {
        _id: tripId,
        passengerId: userId,
        status: 'requested',
      };

      const updatedTrip = {
        ...trip,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      };

      mockTripRepository.findById.mockResolvedValue(trip);
      mockTripRepository.update.mockResolvedValue(updatedTrip);

      const result = await tripService.cancelTrip(tripId, userId, 'pasajero', reason);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedTrip);
      expect(mockTripRepository.update).toHaveBeenCalledWith(tripId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: expect.any(Date),
        cancelledBy: userId,
        updatedAt: expect.any(Date),
      });
    });

    it('should fail to cancel non-existent trip', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const userId = '507f1f77bcf86cd799439011';
      const reason = 'Cambio de planes';

      mockTripRepository.findById.mockResolvedValue(null);

      const result = await tripService.cancelTrip(tripId, userId, reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Viaje no encontrado');
    });

    it('should fail to cancel trip with invalid status', async () => {
      const tripId = '507f1f77bcf86cd799439012';
      const userId = '507f1f77bcf86cd799439011';
      const reason = 'Cambio de planes';

      const trip = {
        _id: tripId,
        passengerId: userId,
        status: 'completed', // Already completed
      };

      mockTripRepository.findById.mockResolvedValue(trip);

      const result = await tripService.cancelTrip(tripId, userId, 'pasajero', reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se puede cambiar de completed a cancelled');
    });
  });

  describe('getActiveTrips', () => {
    it('should get active trips successfully', async () => {
      const activeTrips = [
        { _id: '507f1f77bcf86cd799439012', status: 'requested' },
        { _id: '507f1f77bcf86cd799439013', status: 'accepted' },
      ];

      mockTripRepository.findByStatuses.mockResolvedValue(activeTrips);

      const result = await tripService.getActiveTrips();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(activeTrips);
      expect(mockTripRepository.findByStatuses).toHaveBeenCalled();
    });
  });

  describe('getTripStats', () => {
    it('should get trip statistics successfully', async () => {
      const stats = {
        total: 100,
        completed: 80,
        cancelled: 15,
        active: 5,
        totalFare: 150000,
        averageFare: 1500,
      };

      const trips = [
        { status: 'completed', fare: 1500 },
        { status: 'cancelled', fare: 0 },
        { status: 'requested', fare: 2000 },
      ];
      mockTripRepository.findByPassengerId.mockResolvedValue({ trips });

      const result = await tripService.getTripStats('507f1f77bcf86cd799439011', 'pasajero');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockTripRepository.findByPassengerId).toHaveBeenCalled();
    });
  });
});
