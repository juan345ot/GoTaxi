import { useState, useCallback, useRef, useEffect } from 'react';
import { useThrottle, useDebounce } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de mapas
 * Incluye throttling, clustering, y gestión de memoria
 */
export const useMapOptimization = (options = {}) => {
  const {
    enableThrottling = true,
    throttleDelay = 100,
    enableClustering = true,
    clusterRadius = 50,
    maxZoom = 18,
    minZoom = 1,
    enableCaching = true,
    cacheSize = 1000,
    enableLazyLoading = true,
    lazyLoadDistance = 1000,
  } = options;

  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markers, setMarkers] = useState([]);
  const [clusteredMarkers, setClusteredMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState(new Map());
  const [visibleMarkers, setVisibleMarkers] = useState([]);

  const mapRef = useRef(null);
  const lastUpdateTime = useRef(0);

  // Calcular distancia entre dos puntos
  const calculateDistance = useCallback((point1, point2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Clustering de marcadores
  const clusterMarkers = useCallback((markers, region) => {
    if (!enableClustering) return markers;

    const clusters = [];
    const processed = new Set();

    markers.forEach((marker, index) => {
      if (processed.has(index)) return;

      const cluster = {
        id: `cluster-${index}`,
        latitude: marker.latitude,
        longitude: marker.longitude,
        count: 1,
        markers: [marker],
        isCluster: true,
      };

      // Buscar marcadores cercanos
      markers.forEach((otherMarker, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const distance = calculateDistance(
          { latitude: marker.latitude, longitude: marker.longitude },
          { latitude: otherMarker.latitude, longitude: otherMarker.longitude },
        );

        if (distance < clusterRadius) {
          cluster.markers.push(otherMarker);
          cluster.count++;
          processed.add(otherIndex);
        }
      });

      clusters.push(cluster);
      processed.add(index);
    });

    return clusters;
  }, [enableClustering, clusterRadius, calculateDistance]);

  // Filtrar marcadores visibles
  const filterVisibleMarkers = useCallback((markers, region) => {
    if (!enableLazyLoading) return markers;

    return markers.filter(marker => {
      const distance = calculateDistance(
        { latitude: marker.latitude, longitude: marker.longitude },
        { latitude: region.latitude, longitude: region.longitude },
      );
      return distance < lazyLoadDistance;
    });
  }, [enableLazyLoading, lazyLoadDistance, calculateDistance]);

  // Actualizar marcadores con optimizaciones
  const updateMarkers = useCallback((newMarkers) => {
    const now = Date.now();
    if (enableThrottling && now - lastUpdateTime.current < throttleDelay) {
      return;
    }

    lastUpdateTime.current = now;
    setIsLoading(true);

    // Filtrar marcadores visibles
    const visible = filterVisibleMarkers(newMarkers, region);

    // Aplicar clustering
    const clustered = clusterMarkers(visible, region);

    setMarkers(newMarkers);
    setClusteredMarkers(clustered);
    setVisibleMarkers(visible);
    setIsLoading(false);
  }, [enableThrottling, throttleDelay, region, filterVisibleMarkers, clusterMarkers]);

  // Throttle para actualización de marcadores
  const throttledUpdateMarkers = useThrottle(updateMarkers, throttleDelay);

  // Actualizar región
  const updateRegion = useCallback((newRegion) => {
    setRegion(newRegion);

    // Actualizar marcadores visibles
    const visible = filterVisibleMarkers(markers, newRegion);
    setVisibleMarkers(visible);
  }, [markers, filterVisibleMarkers]);

  // Debounce para actualización de región
  const debouncedUpdateRegion = useDebounce(updateRegion, 300);

  // Animar a región
  const animateToRegion = useCallback((newRegion, duration = 1000) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, duration);
    }
  }, []);

  // Animar a marcador
  const animateToMarker = useCallback((marker, duration = 1000) => {
    if (mapRef.current) {
      const region = {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, duration);
    }
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Obtener marcador del cache
  const getCachedMarker = useCallback((id) => {
    if (!enableCaching) return null;
    return cache.get(id);
  }, [enableCaching, cache]);

  // Guardar marcador en cache
  const setCachedMarker = useCallback((id, marker) => {
    if (!enableCaching) return;

    if (cache.size >= cacheSize) {
      // Eliminar el marcador más antiguo
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(id, marker);
  }, [enableCaching, cache, cacheSize]);

  // Efecto para limpiar cache cuando se cambia la región
  useEffect(() => {
    if (enableCaching) {
      // Limpiar cache de marcadores lejanos
      const newCache = new Map();
      cache.forEach((marker, id) => {
        const distance = calculateDistance(
          { latitude: marker.latitude, longitude: marker.longitude },
          { latitude: region.latitude, longitude: region.longitude },
        );
        if (distance < lazyLoadDistance * 2) {
          newCache.set(id, marker);
        }
      });
      setCache(newCache);
    }
  }, [region, enableCaching, cache, lazyLoadDistance, calculateDistance]);

  return {
    region,
    markers,
    clusteredMarkers,
    visibleMarkers,
    isLoading,
    mapRef,
    updateMarkers: throttledUpdateMarkers,
    updateRegion: debouncedUpdateRegion,
    animateToRegion,
    animateToMarker,
    clearCache,
    getCachedMarker,
    setCachedMarker,
    setRegion,
  };
};
