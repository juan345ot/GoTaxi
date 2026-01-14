import * as Location from 'expo-location';

/**
 * Servicio para obtener rutas entre dos puntos
 * Calcula la ruta más rápida siguiendo las calles
 */
class RouteService {
  /**
   * Obtener ruta entre origen y destino
   * @param {Object} origin - { latitude, longitude }
   * @param {Object} destination - { latitude, longitude }
   * @returns {Promise<Array>} Array de coordenadas que forman la ruta
   */
  async getRoute(origin, destination) {
    try {
      // Intentar usar Google Directions API si está disponible
      // Por ahora, usar una aproximación mejorada con puntos intermedios
      return this.calculateRealisticRoute(origin, destination);
    } catch (error) {
      console.warn('Error obteniendo ruta:', error);
      // Fallback a línea recta si falla
      return [origin, destination];
    }
  }

  /**
   * Calcular una ruta realista con puntos intermedios
   * Esta función crea una ruta que simula seguir las calles principales
   * Usa una aproximación basada en la dirección predominante
   */
  calculateRealisticRoute(origin, destination) {
    const points = [origin];
    
    // Calcular distancia total
    const distance = this.calculateDistance(origin, destination);
    
    // Si la distancia es muy corta, usar línea recta
    if (distance < 0.3) {
      return [origin, destination];
    }

    // Calcular diferencias
    const latDiff = destination.latitude - origin.latitude;
    const lngDiff = destination.longitude - origin.longitude;
    
    // Determinar si la ruta es más horizontal o vertical
    const isHorizontal = Math.abs(lngDiff) > Math.abs(latDiff);
    
    // Calcular número de segmentos basado en la distancia
    // Más segmentos para rutas más largas
    const numSegments = Math.max(5, Math.min(20, Math.floor(distance * 15)));
    
    for (let i = 1; i < numSegments; i++) {
      const progress = i / numSegments;
      
      let lat, lng;
      
      if (isHorizontal) {
        // Ruta principalmente horizontal (este-oeste)
        // Primero ir horizontal, luego ajustar vertical
        lng = origin.longitude + lngDiff * progress;
        // Agregar variación vertical para simular calles
        const verticalVariation = Math.sin(progress * Math.PI) * (latDiff * 0.3);
        lat = origin.latitude + latDiff * progress + verticalVariation;
      } else {
        // Ruta principalmente vertical (norte-sur)
        // Primero ir vertical, luego ajustar horizontal
        lat = origin.latitude + latDiff * progress;
        // Agregar variación horizontal para simular calles
        const horizontalVariation = Math.sin(progress * Math.PI) * (lngDiff * 0.3);
        lng = origin.longitude + lngDiff * progress + horizontalVariation;
      }
      
      // Agregar pequeñas variaciones para simular seguir calles
      const streetVariation = 0.0003; // Aproximadamente 30 metros
      if (i % 2 === 0) {
        lat += streetVariation * Math.sin(progress * Math.PI * 3);
        lng += streetVariation * Math.cos(progress * Math.PI * 3);
      }
      
      points.push({ latitude: lat, longitude: lng });
    }
    
    points.push(destination);
    return points;
  }

  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Obtener ruta usando Google Directions API (si está configurada)
   * @private
   */
  async getRouteFromGoogleDirections(origin, destination) {
    // Esta función se puede implementar si tienen Google Directions API
    // Por ahora retorna null para usar la aproximación
    return null;
  }
}

export default new RouteService();
