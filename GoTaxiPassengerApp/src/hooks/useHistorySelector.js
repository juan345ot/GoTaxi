import { useContextSelector } from './useContextSelector';
import { HistoryContext } from '../contexts/HistoryContext';

/**
 * Hook optimizado para acceder a propiedades específicas del HistoryContext
 * Evita re-renders innecesarios cuando solo cambian partes específicas del contexto
 */

// Selectors básicos
export const useHistoryTrips = () => useContextSelector(HistoryContext, state => state.trips);
export const useHistoryLoading = () => useContextSelector(HistoryContext, state => state.loading);
export const useHistoryError = () => useContextSelector(HistoryContext, state => state.error);

// Selectors derivados
export const useHistoryTotalTrips = () => useContextSelector(HistoryContext, state => state.totalTrips);
export const useHistoryHasTrips = () => useContextSelector(HistoryContext, state => state.hasTrips);
export const useHistoryRecentTrips = () => useContextSelector(HistoryContext, state => state.recentTrips);
export const useHistoryCompletedTrips = () => useContextSelector(HistoryContext, state => state.completedTrips);
export const useHistoryCancelledTrips = () => useContextSelector(HistoryContext, state => state.cancelledTrips);
export const useHistoryPendingTrips = () => useContextSelector(HistoryContext, state => state.pendingTrips);
export const useHistoryTotalSpent = () => useContextSelector(HistoryContext, state => state.totalSpent);
export const useHistoryAverageRating = () => useContextSelector(HistoryContext, state => state.averageRating);

// Selector combinado para casos comunes
export const useHistoryState = () => useContextSelector(HistoryContext, state => ({
  trips: state.trips,
  loading: state.loading,
  error: state.error,
}));

// Selector para estadísticas
export const useHistoryStats = () => useContextSelector(HistoryContext, state => ({
  totalTrips: state.totalTrips,
  completedTrips: state.completedTrips.length,
  cancelledTrips: state.cancelledTrips.length,
  pendingTrips: state.pendingTrips.length,
  totalSpent: state.totalSpent,
  averageRating: state.averageRating,
  completionRate: state.totalTrips > 0 ? (state.completedTrips.length / state.totalTrips) * 100 : 0,
}));

// Selector para información de viajes
export const useHistoryTripInfo = () => useContextSelector(HistoryContext, state => ({
  hasTrips: state.hasTrips,
  recentTrips: state.recentTrips,
  totalSpent: state.totalSpent,
  averageRating: state.averageRating,
}));

// Selectors de funciones
export const useHistoryActions = () => useContextSelector(HistoryContext, state => ({
  addTrip: state.addTrip,
  updateTrip: state.updateTrip,
  removeTrip: state.removeTrip,
  clearTrips: state.clearTrips,
  getTripById: state.getTripById,
  getTripsByStatus: state.getTripsByStatus,
  getTripsByDateRange: state.getTripsByDateRange,
}));

// Selector para filtros
export const useHistoryFilters = () => useContextSelector(HistoryContext, state => ({
  byStatus: (status) => state.getTripsByStatus(status),
  byDateRange: (startDate, endDate) => state.getTripsByDateRange(startDate, endDate),
  byId: (id) => state.getTripById(id),
}));

// Selector para validación
export const useHistoryValidation = () => useContextSelector(HistoryContext, state => ({
  hasTrips: state.hasTrips,
  hasError: !!state.error,
  isLoading: state.loading,
  canAddTrip: !state.loading,
  canModifyTrips: !state.loading && !state.error,
}));

export default {
  useHistoryTrips,
  useHistoryLoading,
  useHistoryError,
  useHistoryTotalTrips,
  useHistoryHasTrips,
  useHistoryRecentTrips,
  useHistoryCompletedTrips,
  useHistoryCancelledTrips,
  useHistoryPendingTrips,
  useHistoryTotalSpent,
  useHistoryAverageRating,
  useHistoryState,
  useHistoryStats,
  useHistoryTripInfo,
  useHistoryActions,
  useHistoryFilters,
  useHistoryValidation,
};
