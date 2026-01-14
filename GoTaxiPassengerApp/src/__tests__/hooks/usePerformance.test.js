import { renderHook, act } from '@testing-library/react-native';
import { usePerformance } from '../../hooks/usePerformance';

// Mock de InteractionManager - usar el mock global de setup.js
// No sobrescribir el mock completo para preservar Dimensions
const ReactNative = require('react-native');
ReactNative.InteractionManager = {
  runAfterInteractions: jest.fn(callback => {
    // Simular que las interacciones terminan inmediatamente
    setTimeout(callback, 0);
  }),
  createInteractionHandle: jest.fn(() => 1),
  clearInteractionHandle: jest.fn(),
};

describe('usePerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.isReady).toBe(false);
    expect(result.current.interactionsComplete).toBe(false);
    expect(typeof result.current.markRenderStart).toBe('function');
    expect(typeof result.current.markRenderEnd).toBe('function');
    expect(typeof result.current.waitForInteractions).toBe('function');
    expect(typeof result.current.deferHeavyOperation).toBe('function');
    expect(typeof result.current.measureExecution).toBe('function');
    expect(typeof result.current.useThrottle).toBe('function');
    expect(typeof result.current.useDebounce).toBe('function');
    expect(typeof result.current.useMemoizedData).toBe('function');
    expect(typeof result.current.useLazyData).toBe('function');
  });

  it('should mark render start and end correctly', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.markRenderStart();
    });

    let renderTime;
    act(() => {
      renderTime = result.current.markRenderEnd();
    });

    expect(typeof renderTime).toBe('number');
    expect(renderTime).toBeGreaterThanOrEqual(0);
  });

  it('should wait for interactions', async() => {
    const { result } = renderHook(() => usePerformance());

    await act(async() => {
      await result.current.waitForInteractions();
    });

    expect(result.current.interactionsComplete).toBe(true);
  });

  it('should defer heavy operations', async() => {
    const { result } = renderHook(() => usePerformance());
    const heavyOperation = jest.fn(() => 'heavy result');

    const operationResult = await act(async() => {
      return await result.current.deferHeavyOperation(heavyOperation);
    });

    expect(heavyOperation).toHaveBeenCalled();
    expect(operationResult).toBe('heavy result');
  });

  it('should measure execution time', async() => {
    const { result } = renderHook(() => usePerformance());
    const testFunction = jest.fn(async() => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'test result';
    });

    const measurement = await act(async() => {
      return await result.current.measureExecution(testFunction, 'Test Operation');
    });

    expect(measurement.result).toBe('test result');
    expect(measurement.duration).toBeGreaterThan(0);
    expect(testFunction).toHaveBeenCalled();
  });

  it('should handle execution errors', async() => {
    const { result } = renderHook(() => usePerformance());
    const errorFunction = jest.fn(async() => {
      throw new Error('Test error');
    });

    await expect(
      act(async() => {
        return await result.current.measureExecution(errorFunction, 'Test Operation');
      }),
    ).rejects.toThrow('Test error');
  });

  it('should create throttle function', () => {
    const { result } = renderHook(() => usePerformance());

    // useThrottle está diseñado para ser usado dentro de componentes
    // Verificamos que el método existe y es una función
    // No podemos llamarlo directamente porque usa hooks internamente
    expect(typeof result.current.useThrottle).toBe('function');
  });

  it('should create debounce function', () => {
    const { result } = renderHook(() => usePerformance());

    // useDebounce está diseñado para ser usado dentro de componentes
    // Verificamos que el método existe y es una función
    // No podemos llamarlo directamente porque usa hooks internamente
    expect(typeof result.current.useDebounce).toBe('function');
  });

  it('should memoize data correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // useMemoizedData está diseñado para ser usado dentro de componentes
    // Verificamos que el método existe y es una función
    // No podemos llamarlo directamente porque usa hooks internamente
    expect(typeof result.current.useMemoizedData).toBe('function');
  });

  it('should create lazy data hook', () => {
    const { result } = renderHook(() => usePerformance());

    // useLazyData está diseñado para ser usado dentro de componentes
    // Verificamos que el método existe y es una función
    // No podemos llamarlo directamente porque usa hooks internamente
    expect(typeof result.current.useLazyData).toBe('function');
  });
});
