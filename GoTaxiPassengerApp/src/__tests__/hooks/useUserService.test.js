import { renderHook } from '@testing-library/react-native';
import { useUserService } from '../../hooks/useUserService';
import UserService from '../../services/UserService';
import UserRepository from '../../infrastructure/repositories/UserRepository';

// Mock de las dependencias
jest.mock('../../services/UserService');
jest.mock('../../infrastructure/repositories/UserRepository');
jest.mock('../../api/axiosInstance', () => ({}));

describe('useUserService', () => {
  let mockUserService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
      uploadAvatar: jest.fn(),
      deleteAccount: jest.fn(),
      getUserSettings: jest.fn(),
      updateUserSettings: jest.fn(),
    };

    mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
      uploadAvatar: jest.fn(),
      deleteAccount: jest.fn(),
      getUserSettings: jest.fn(),
      updateUserSettings: jest.fn(),
    };

    UserService.mockImplementation(() => mockUserService);
    UserRepository.mockImplementation(() => mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return UserService instance', () => {
    const { result } = renderHook(() => useUserService());

    expect(result.current).toBe(mockUserService);
    expect(UserService).toHaveBeenCalled();
  });

  it('should create new instance on each render', () => {
    const { result, rerender } = renderHook(() => useUserService());
    const firstInstance = result.current;

    rerender();
    const secondInstance = result.current;

    expect(firstInstance).toBe(secondInstance); // Should be memoized
  });

  it('should pass UserRepository to UserService', () => {
    renderHook(() => useUserService());

    expect(UserRepository).toHaveBeenCalled();
    expect(UserService).toHaveBeenCalled();
  });
});
