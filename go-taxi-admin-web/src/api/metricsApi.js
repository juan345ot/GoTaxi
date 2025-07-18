import axios from "./axiosInstance";

/** Helper para GET */
const apiGet = async (url, params = {}) => {
  try {
    const { data } = await axios.get(url, { params });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al consultar métricas" };
  }
};

/** Helper para POST */
const apiPost = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al crear métrica" };
  }
};

/** Helper para PUT */
const apiPut = async (url, payload) => {
  try {
    const { data } = await axios.put(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar métrica" };
  }
};

/** Helper para DELETE */
const apiDelete = async (url) => {
  try {
    const { data } = await axios.delete(url);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al eliminar métrica" };
  }
};

// ============= MÉTRICAS PRINCIPALES =============

export const getMetrics = (params = {}) => apiGet("/metrics", params);
export const getMetricsById = (id) => apiGet(`/metrics/${id}`);
export const createMetric = (metric) => apiPost("/metrics", metric);
export const updateMetric = (id, metric) => apiPut(`/metrics/${id}`, metric);
export const deleteMetric = (id) => apiDelete(`/metrics/${id}`);

// ============= FILTROS Y AGRUPADORES =============

export const getMetricsByType = (type) => apiGet(`/metrics/type/${type}`);
export const getMetricsByDateRange = (startDate, endDate) => apiGet(`/metrics/date-range`, { startDate, endDate });
export const getMetricsByStatus = (status) => apiGet(`/metrics/status/${status}`);
export const getMetricsByUser = (userId) => apiGet(`/metrics/user/${userId}`);
export const getMetricsByCategory = (category) => apiGet(`/metrics/category/${category}`);
export const getMetricsByLocation = (location) => apiGet(`/metrics/location/${location}`);
export const getMetricsByTimeRange = (startTime, endTime) => apiGet(`/metrics/time-range`, { startTime, endTime });
export const getMetricsByValueRange = (minValue, maxValue) => apiGet(`/metrics/value-range`, { minValue, maxValue });
export const getMetricsByTag = (tag) => apiGet(`/metrics/tag/${tag}`);
export const getMetricsByDate = (date) => apiGet(`/metrics/date/${date}`);
export const getMetricsByTime = (time) => apiGet(`/metrics/time/${time}`);
export const getMetricsByDateTimeRange = (startDateTime, endDateTime) => apiGet(`/metrics/date-time-range`, { startDateTime, endDateTime });
export const getMetricsByCustomDateRange = (startDate, endDate) => apiGet(`/metrics/custom-date-range`, { startDate, endDate });

// ============= CONSULTAS AVANZADAS =============

export const getMetricsByCustomFilter = (filter) => apiPost(`/metrics/custom-filter`, filter);
export const getMetricsByCustomQuery = (query) => apiPost(`/metrics/custom-query`, query);
export const getMetricsByMultipleCriteria = (criteria) => apiPost(`/metrics/multiple-criteria`, criteria);
export const getMetricsByAdvancedFilter = (filter) => apiPost(`/metrics/advanced-filter`, filter);

// ============= OTRAS =============

export const getMetricsSummary = () => apiGet(`/metrics/summary`);
export const getMetricsTrends = (period) => apiGet(`/metrics/trends`, { period });
export const getMetricsComparison = (metric1, metric2) => apiGet(`/metrics/comparison`, { metric1, metric2 });
export const getMetricsAggregatedData = (aggregationType) => apiGet(`/metrics/aggregated-data`, { aggregationType });

/*
// Ejemplo TEST UNITARIO (con Jest)
import { getMetrics } from './metricsApi';
test('getMetrics: debería retornar array o error', async () => {
  const res = await getMetrics();
  expect(res.data || res.error).toBeDefined();
});
*/

