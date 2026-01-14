import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useOptimizedList } from '../../hooks/useOptimizedList';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import EmptyState from './EmptyState';

/**
 * Componente de lista optimizado con paginación, búsqueda y filtrado
 * @param {Object} props - Props del componente
 */
const OptimizedList = memo(function OptimizedList({
  data = [],
  renderItem,
  keyExtractor,
  onRefresh,
  onLoadMore,
  searchFields = [],
  filterFields = [],
  sortFields = [],
  pageSize = 20,
  enableSearch = true,
  enableFilter = true,
  enableSort = true,
  enablePagination: _enablePagination = true, // Reservado para uso futuro
  enablePullToRefresh = true,
  enableInfiniteScroll = false,
  emptyMessage = 'No hay elementos para mostrar',
  loadingMessage = 'Cargando...',
  searchPlaceholder: _searchPlaceholder = 'Buscar...', // Reservado para uso futuro
  style,
  contentContainerStyle,
  ...flatListProps
}) {
  const {
    createCallback: _createCallback, // Reservado para uso futuro
    createMemo: _createMemo, // Reservado para uso futuro
    createDebouncedCallback,
  } = usePerformanceOptimization();

  // Configuración del hook de lista optimizada
  const listOptions = useMemo(() => ({
    pageSize,
    enableSearch,
    enableFilter,
    enableSort,
    searchFields,
    filterFields,
    sortFields,
  }), [pageSize, enableSearch, enableFilter, enableSort, searchFields, filterFields, sortFields]);

  const {
    data: paginatedData,
    allData: filteredData,
    isLoading,
    searchTerm: _searchTerm, // Reservado para uso futuro
    filters: _filters, // Reservado para uso futuro
    sortConfig: _sortConfig, // Reservado para uso futuro
    pagination,
    setSearch,
    setFilter,
    clearFilters: _clearFilters, // Reservado para uso futuro
    setSort,
    goToPage: _goToPage, // Reservado para uso futuro
    nextPage: _nextPage, // Reservado para uso futuro
    prevPage: _prevPage, // Reservado para uso futuro
    refresh,
  } = useOptimizedList(data, listOptions);

  // Callbacks optimizados
  const handleRefresh = useCallback(async() => {
    if (onRefresh) {
      await refresh(onRefresh);
    }
  }, [onRefresh, refresh]);

  const handleLoadMore = useCallback(() => {
    if (enableInfiniteScroll && pagination.hasNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [enableInfiniteScroll, pagination.hasNextPage, onLoadMore]);

  // Funciones reservadas para uso futuro
  const _handleSearch = useCallback((term) => {
    setSearch(term);
  }, [setSearch]);

  const _handleFilter = useCallback((key, value) => {
    setFilter(key, value);
  }, [setFilter]);

  const _handleSort = useCallback((key) => {
    setSort(key);
  }, [setSort]);

  // Memoizar el renderItem para evitar re-renders innecesarios
  const memoizedRenderItem = useCallback(({ item, index }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  // Memoizar el keyExtractor
  const memoizedKeyExtractor = useCallback((item, index) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    return item.id?.toString() || index.toString();
  }, [keyExtractor]);

  // Memoizar el refresh control
  const refreshControl = useMemo(() => {
    if (!enablePullToRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={handleRefresh}
        colors={['#007AFF']}
        tintColor="#007AFF"
      />
    );
  }, [enablePullToRefresh, isLoading, handleRefresh]);

  // Memoizar el footer de carga
  const renderFooter = useMemo(() => {
    if (!isLoading || !enableInfiniteScroll) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>{loadingMessage}</Text>
      </View>
    );
  }, [isLoading, enableInfiniteScroll, loadingMessage]);

  // Memoizar el empty state
  const renderEmpty = useMemo(() => {
    if (filteredData.length > 0) return null;

    return (
      <EmptyState
        message={emptyMessage}
        icon="search"
      />
    );
  }, [filteredData.length, emptyMessage]);

  // Memoizar el onEndReached
  const handleEndReached = useMemo(() => {
    if (!enableInfiniteScroll) return undefined;

    return createDebouncedCallback(handleLoadMore, [handleLoadMore], 500);
  }, [enableInfiniteScroll, handleLoadMore, createDebouncedCallback]);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={paginatedData}
        renderItem={memoizedRenderItem}
        keyExtractor={memoizedKeyExtractor}
        refreshControl={refreshControl}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={undefined} // Se puede optimizar si se conoce la altura fija
        {...flatListProps}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default OptimizedList;
