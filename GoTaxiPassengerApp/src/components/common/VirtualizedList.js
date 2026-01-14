import { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useVirtualizedList } from '../../hooks/usePerformanceOptimization';

/**
 * Componente de lista virtualizada para optimizar el rendimiento
 * con listas grandes de datos
 */
const VirtualizedList = memo(({
  data = [],
  renderItem,
  keyExtractor,
  itemHeight = 50,
  overscan = 5,
  enableVirtualization = true,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  style,
  contentContainerStyle,
  ..._props // Reservado para props adicionales futuras
}) => {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    handleLayout,
    isScrolling,
  } = useVirtualizedList(data, {
    itemHeight,
    overscan,
    enableVirtualization,
  });

  // Memoizar el componente de item
  const MemoizedItem = useCallback(({ item, index }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  // Memoizar el key extractor
  const memoizedKeyExtractor = useCallback((item, index) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    return `item-${index}`;
  }, [keyExtractor]);

  // Memoizar el componente de separador
  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  // Memoizar el componente de loading
  const LoadingComponent = useCallback(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#007AFF" />
      <Text style={styles.loadingText}>Cargando más elementos...</Text>
    </View>
  ), []);

  // Memoizar el componente de error (reservado para uso futuro)
  // const ErrorComponent = useCallback(() => (
  //   <View style={styles.errorContainer}>
  //     <Text style={styles.errorText}>Error al cargar los datos</Text>
  //   </View>
  // ), []);

  // Configuración optimizada del FlatList
  const flatListProps = useMemo(() => ({
    data: enableVirtualization ? visibleItems : data,
    renderItem: MemoizedItem,
    keyExtractor: memoizedKeyExtractor,
    onScroll: handleScroll,
    onLayout: handleLayout,
    onEndReached,
    onEndReachedThreshold,
    refreshing,
    onRefresh,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent: ListFooterComponent || (refreshing ? LoadingComponent : null),
    ItemSeparatorComponent: ItemSeparator,
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    removeClippedSubviews: true, // Optimización de memoria
    maxToRenderPerBatch: 10, // Renderizar en lotes pequeños
    updateCellsBatchingPeriod: 50, // Actualizar cada 50ms
    initialNumToRender: 10, // Renderizar solo 10 items inicialmente
    windowSize: 10, // Mantener 10 pantallas en memoria
    getItemLayout: enableVirtualization ? (_, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }) : undefined,
    style: [styles.container, style],
    contentContainerStyle: [
      enableVirtualization && { height: totalHeight },
      contentContainerStyle,
    ],
    ..._props,
  }), [
    data,
    visibleItems,
    enableVirtualization,
    MemoizedItem,
    memoizedKeyExtractor,
    handleScroll,
    handleLayout,
    onEndReached,
    onEndReachedThreshold,
    refreshing,
    onRefresh,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    LoadingComponent,
    ItemSeparator,
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    style,
    contentContainerStyle,
    totalHeight,
    itemHeight,
    _props,
  ]);

  // Si no hay virtualización, usar FlatList normal
  if (!enableVirtualization) {
    return (
      <FlatList
        {...flatListProps}
        data={data}
        contentContainerStyle={contentContainerStyle}
      />
    );
  }

  // Renderizar con virtualización
  return (
    <View style={styles.wrapper}>
      <FlatList
        {...flatListProps}
        data={visibleItems}
        contentContainerStyle={[
          { height: totalHeight },
          contentContainerStyle,
        ]}
      />

      {/* Indicador de scroll para debugging */}
      {__DEV__ && isScrolling && (
        <View style={styles.debugIndicator}>
          <Text style={styles.debugText}>
            Scroll: {Math.round(offsetY)}px
          </Text>
        </View>
      )}
    </View>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  debugIndicator: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default VirtualizedList;
