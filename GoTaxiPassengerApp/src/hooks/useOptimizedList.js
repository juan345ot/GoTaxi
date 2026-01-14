import { useState, useCallback, useMemo, useRef } from 'react';

/**
 * Hook personalizado para optimizar el manejo de listas con paginación, filtrado y búsqueda
 * @param {Array} initialData - Datos iniciales de la lista
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Objeto con funciones y estado optimizados
 */
export const useOptimizedList = (initialData = [], options = {}) => {
  const {
    pageSize = 20,
    enableSearch = true,
    enableFilter = true,
    enableSort = true,
    searchFields = [],
    filterFields = [],
    sortFields = [],
  } = options;

  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const _searchTimeoutRef = useRef(null); // Reservado para uso futuro

  // Memoizar datos filtrados y buscados
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar búsqueda
    if (enableSearch && searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchLower);
        }),
      );
    }

    // Aplicar filtros
    if (enableFilter && Object.keys(filters).length > 0) {
      result = result.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (value === null || value === undefined || value === '') return true;
          return item[key] === value;
        }),
      );
    }

    // Aplicar ordenamiento
    if (enableSort && sortConfig.key && sortFields.includes(sortConfig.key)) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, enableSearch, enableFilter, enableSort, searchFields, sortFields]);

  // Memoizar datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Memoizar información de paginación
  const paginationInfo = useMemo(() => {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      hasNextPage,
      hasPrevPage,
      startIndex: (currentPage - 1) * pageSize + 1,
      endIndex: Math.min(currentPage * pageSize, totalItems),
    };
  }, [filteredData.length, currentPage, pageSize]);

  // Callbacks optimizados
  const updateData = useCallback((newData) => {
    setData(newData);
    setCurrentPage(1); // Reset a la primera página
  }, []);

  const addItem = useCallback((item) => {
    setData(prev => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item,
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  const setSearch = useCallback((term) => {
    // Debounce para búsquedas
    if (_searchTimeoutRef.current) {
      clearTimeout(_searchTimeoutRef.current);
    }

    _searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset a la primera página
    }, 300);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset a la primera página
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const setSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)));
  }, [paginationInfo.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPrevPage]);

  const refresh = useCallback(async(refreshFn) => {
    if (refreshFn) {
      setIsLoading(true);
      try {
        const newData = await refreshFn();
        updateData(newData);
      } catch (error) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error('Error refreshing data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [updateData]);

  return {
    // Datos
    data: paginatedData,
    allData: filteredData,
    originalData: data,

    // Estado
    isLoading,
    searchTerm,
    filters,
    sortConfig,

    // Información de paginación
    pagination: paginationInfo,

    // Funciones de datos
    updateData,
    addItem,
    updateItem,
    removeItem,

    // Funciones de búsqueda y filtrado
    setSearch,
    setFilter,
    clearFilters,
    setSort,

    // Funciones de paginación
    goToPage,
    nextPage,
    prevPage,

    // Utilidades
    refresh,
  };
};

export default useOptimizedList;
