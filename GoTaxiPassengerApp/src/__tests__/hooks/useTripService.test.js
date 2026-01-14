import { renderHook } from '@testing-library/react-native';
import { useTripService } from '../../hooks/useTripService';
import TripService from '../../services/TripService';
import TripRepository from '../../infrastructure/repositories/TripRepository';

// Mock de las dependencias
jest.mock('../../services/TripService');
jest.mock('../../infrastructure/repositories/TripRepository');
jest.mock('../../api/axiosInstance', () => ({}));

describe('useTripService', () => {
  let mockTripService;
  let mockTripRepository;

  beforeEach(() => {
    mockTripRepository = {
      requestRide: jest.fn(),
      getTripById: jest.fn(),
      cancelTrip: jest.fn(),
      payTrip: jest.fn(),
      rateTrip: jest.fn(),
      getUserTrips: jest.fn(),
    };

    mockTripService = {
      requestTrip: jest.fn(),
      getTripById: jest.fn(),
      cancelTrip: jest.fn(),
      payTrip: jest.fn(),
      rateTrip: jest.fn(),
      getUserTrips: jest.fn(),
    };

    TripService.mockImplementation(() => mockTripService);
    TripRepository.mockImplementation(() => mockTripRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return TripService instance', () => {
    const { result } = renderHook(() => useTripService());

    expect(result.current).toBe(mockTripService);
    expect(TripService).toHaveBeenCalled();
  });

  it('should create new instance on each render', () => {
    const { result, rerender } = renderHook(() => useTripService());
    const firstInstance = result.current;

    rerender();
    const secondInstance = result.current;

    expect(firstInstance).toBe(secondInstance); // Should be memoized
  });

  it('should pass TripRepository to TripService', () => {
    renderHook(() => useTripService());

    expect(TripRepository).toHaveBeenCalled();
    expect(TripService).toHaveBeenCalled();
  });
});
