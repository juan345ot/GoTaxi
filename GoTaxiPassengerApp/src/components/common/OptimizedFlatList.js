import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Componente FlatList optimizado con memoización y lazy loading
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Datos para mostrar en la lista
 * @param {Function} props.renderItem - Función para renderizar cada item
 * @param {Function} props.keyExtractor - Función para extraer la clave única de cada item
 * @param {Function} props.onEndReached - Callback cuando se llega al final
 * @param {Function} props.onRefresh - Callback para refrescar
 * @param {boolean} props.refreshing - Estado de refresh
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {string} props.loadingMessage - Mensaje de carga
 * @param {number} props.threshold - Threshold para onEndReached
 * @param {number} props.maxToRenderPerBatch - Máximo de items a renderizar por batch
 * @param {number} props.windowSize - Tamaño de ventana para virtualización
 * @param {number} props.initialNumToRender - Número inicial de items a renderizar
 * @param {boolean} props.removeClippedSubviews - Remover subvistas recortadas
 * @param {Function} props.getItemLayout - Función para obtener layout de items
 * @param {Object} props.style - Estilos del contenedor
 * @param {Object} props.contentContainerStyle - Estilos del contenido
 */
const OptimizedFlatList = memo(
  ({
    data = [],
    renderItem,
    keyExtractor,
    onEndReached,
    onRefresh,
    refreshing = false,
    loading = false,
    emptyMessage = 'No hay datos disponibles',
    loadingMessage = 'Cargando...',
    threshold = 0.5,
    maxToRenderPerBatch = 10,
    windowSize = 10,
    initialNumToRender = 10,
    removeClippedSubviews = true,
    getItemLayout,
    style,
    contentContainerStyle,
    ...props
  }) => {
    // Memoizar el renderItem para evitar re-renders innecesarios
    const memoizedRenderItem = useCallback(
      ({ item, index }) => {
        return renderItem({ item, index });
      },
      [renderItem],
    );

    // Memoizar el keyExtractor
    const memoizedKeyExtractor = useCallback(
      (item, index) => {
        if (keyExtractor) {
          return keyExtractor(item, index);
        }
        return item.id?.toString() || index.toString();
      },
      [keyExtractor],
    );

    // Memoizar el onEndReached para evitar re-renders
    const memoizedOnEndReached = useCallback(() => {
      if (onEndReached && !loading) {
        onEndReached();
      }
    }, [onEndReached, loading]);

    // Memoizar el onRefresh
    const memoizedOnRefresh = useCallback(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, [onRefresh]);

    // Memoizar la configuración de performance
    const performanceConfig = useMemo(
      () => ({
        maxToRenderPerBatch,
        windowSize,
        initialNumToRender,
        removeClippedSubviews,
        getItemLayout,
        onEndReachedThreshold: threshold,
      }),
      [
        maxToRenderPerBatch,
        windowSize,
        initialNumToRender,
        removeClippedSubviews,
        getItemLayout,
        threshold,
      ],
    );

    // Componente de loading
    const LoadingComponent = memo(() => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    ));

    // Componente de empty state
    const EmptyComponent = memo(() => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    ));

    // Si está cargando y no hay datos, mostrar loading
    if (loading && data.length === 0) {
      return <LoadingComponent />;
    }

    return (
      <FlatList
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={memoizedKeyExtractor}
        onEndReached={memoizedOnEndReached}
        onRefresh={memoizedOnRefresh}
        refreshing={refreshing}
        ListEmptyComponent={EmptyComponent}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...performanceConfig}
        {...props}
      />
    );
  },
);

OptimizedFlatList.displayName = 'OptimizedFlatList';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default OptimizedFlatList;
