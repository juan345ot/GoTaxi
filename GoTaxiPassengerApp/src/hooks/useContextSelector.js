import { useContext, useMemo, useRef, useCallback } from 'react';

/**
 * Hook para optimizar el uso de contextos con selectors
 * Evita re-renders innecesarios cuando solo cambian partes específicas del contexto
 * @param {Context} context - Contexto de React
 * @param {Function} selector - Función selector que extrae la parte específica del contexto
 * @param {Function} equalityFn - Función de comparación personalizada (opcional)
 * @returns {any} - Valor seleccionado del contexto
 */
export const useContextSelector = (context, selector, equalityFn) => {
  const contextValue = useContext(context);

  // Referencia para almacenar el valor anterior
  const prevValueRef = useRef();
  const prevSelectorRef = useRef();

  // Función de comparación por defecto
  const defaultEqualityFn = useCallback((a, b) => a === b, []);

  const isEqual = equalityFn || defaultEqualityFn;

  // Memoizar el valor seleccionado
  const selectedValue = useMemo(() => {
    const newValue = selector(contextValue);

    // Si el selector no ha cambiado y el valor es igual, devolver el valor anterior
    if (
      prevSelectorRef.current === selector &&
      prevValueRef.current !== undefined &&
      isEqual(prevValueRef.current, newValue)
    ) {
      return prevValueRef.current;
    }

    // Actualizar referencias
    prevValueRef.current = newValue;
    prevSelectorRef.current = selector;

    return newValue;
  }, [contextValue, selector, isEqual]);

  return selectedValue;
};

/**
 * Hook para crear un selector memoizado
 * @param {Function} selector - Función selector
 * @param {Array} deps - Dependencias del selector
 * @returns {Function} - Selector memoizado
 */
export const useMemoizedSelector = (selector, deps = []) => {
  return useMemo(() => selector, deps);
};

/**
 * Hook para crear múltiples selectors de un contexto
 * @param {Context} context - Contexto de React
 * @param {Object} selectors - Objeto con selectors
 * @returns {Object} - Objeto con valores seleccionados
 */
export const useContextSelectors = (context, selectors) => {
  const contextValue = useContext(context);

  return useMemo(() => {
    const result = {};

    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = selector(contextValue);
    }

    return result;
  }, [contextValue, selectors]);
};

/**
 * Hook para crear un selector que solo se ejecuta cuando las dependencias cambian
 * @param {Function} selector - Función selector
 * @param {Array} deps - Dependencias del selector
 * @returns {Function} - Selector optimizado
 */
export const useDependentSelector = (selector, deps) => {
  return useCallback(selector, deps);
};

/**
 * Hook para crear un selector con transformación
 * @param {Function} selector - Función selector
 * @param {Function} transformer - Función de transformación
 * @param {Array} deps - Dependencias
 * @returns {any} - Valor transformado
 */
export const useTransformedSelector = (selector, transformer, deps = []) => {
  return useMemo(() => {
    const selectedValue = selector();
    return transformer(selectedValue);
  }, deps);
};

/**
 * Hook para crear un selector que devuelve un valor por defecto si no existe
 * @param {Function} selector - Función selector
 * @param {any} defaultValue - Valor por defecto
 * @param {Array} deps - Dependencias
 * @returns {any} - Valor seleccionado o valor por defecto
 */
export const useDefaultSelector = (selector, defaultValue, deps = []) => {
  return useMemo(() => {
    const value = selector();
    return value !== undefined && value !== null ? value : defaultValue;
  }, deps);
};

/**
 * Hook para crear un selector que filtra valores
 * @param {Function} selector - Función selector
 * @param {Function} filterFn - Función de filtrado
 * @param {Array} deps - Dependencias
 * @returns {any} - Valor filtrado
 */
export const useFilteredSelector = (selector, filterFn, deps = []) => {
  return useMemo(() => {
    const value = selector();
    return filterFn(value);
  }, deps);
};

export default useContextSelector;
