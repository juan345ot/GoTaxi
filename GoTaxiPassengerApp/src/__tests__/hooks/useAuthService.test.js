import { renderHook } from '@testing-library/react-native';
import { useAuthService } from '../../hooks/useAuthService';
import AuthService from '../../services/AuthService';
import AuthRepository from '../../infrastructure/repositories/AuthRepository';

// Mock de las dependencias
jest.mock('../../services/AuthService');
jest.mock('../../infrastructure/repositories/AuthRepository');
jest.mock('../../api/axiosInstance', () => ({}));

describe('useAuthService', () => {
  let mockAuthService;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
      logout: jest.fn(),
    };

    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
      logout: jest.fn(),
    };

    AuthService.mockImplementation(() => mockAuthService);
    AuthRepository.mockImplementation(() => mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return AuthService instance', () => {
    const { result } = renderHook(() => useAuthService());

    expect(result.current).toBe(mockAuthService);
    expect(AuthService).toHaveBeenCalled();
  });

  it('should create new instance on each render', () => {
    const { result, rerender } = renderHook(() => useAuthService());
    const firstInstance = result.current;

    rerender();
    const secondInstance = result.current;

    expect(firstInstance).toBe(secondInstance); // Should be memoized
  });

  it('should pass AuthRepository to AuthService', () => {
    renderHook(() => useAuthService());

    expect(AuthRepository).toHaveBeenCalled();
    expect(AuthService).toHaveBeenCalled();
  });
});
