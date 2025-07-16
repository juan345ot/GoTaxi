import axios from "./axiosInstance";

export const getMetrics = async () => {
  const { data } = await axios.get('/metrics');
  return data;
};
export const getMetricsById = async (id) => {
  const { data } = await axios.get(`/metrics/${id}`);
  return data;
}
export const createMetric = async (metric) => {
  const { data } = await axios.post('/metrics', metric);
  return data;
}; 
export const updateMetric = async (id, metric) => {
  const { data } = await axios.put(`/metrics/${id}`, metric);
  return data;
}
export const deleteMetric = async (id) => {
  const { data } = await axios.delete(`/metrics/${id}`);
  return data;
}
export const getMetricsByType = async (type) => {
  const { data } = await axios.get(`/metrics/type/${type}`);
  return data;
}
export const getMetricsByDateRange = async (startDate, endDate) => {
  const { data } = await axios.get(`/metrics/date-range`, {
    params: {
      startDate,
      endDate
    }
  });
  return data;
}
export const getMetricsByStatus = async (status) => {
  const { data } = await axios.get(`/metrics/status/${status}`);
  return data;
}
export const getMetricsByUser = async (userId) => {
  const { data } = await axios.get(`/metrics/user/${userId}`);
  return data;
}
export const getMetricsByCategory = async (category) => {
  const { data } = await axios.get(`/metrics/category/${category}`);
  return data;
}
export const getMetricsByLocation = async (location) => {
  const { data } = await axios.get(`/metrics/location/${location}`);
  return data;
}
export const getMetricsByTimeRange = async (startTime, endTime) => {
  const { data } = await axios.get(`/metrics/time-range`, {
    params: {
      startTime,
      endTime
    }
  });
  return data;
}
export const getMetricsByValueRange = async (minValue, maxValue) => {
  const { data } = await axios.get(`/metrics/value-range`, {
    params: {
      minValue,
      maxValue
    }
  });
  return data;
}
export const getMetricsByTag = async (tag) => {
  const { data } = await axios.get(`/metrics/tag/${tag}`);
  return data;
}
export const getMetricsByCustomFilter = async (filter) => {
  const { data } = await axios.post(`/metrics/custom-filter`, filter);
  return data;
}
export const getMetricsSummary = async () => {
  const { data } = await axios.get(`/metrics/summary`);
  return data;
}
export const getMetricsTrends = async (period) => {
  const { data } = await axios.get(`/metrics/trends`, {
    params: { period }
  });
  return data;
}  
export const getMetricsComparison = async (metric1, metric2) => {
  const { data } = await axios.get(`/metrics/comparison`, {
    params: { metric1, metric2 }
  });
  return data;
}
export const getMetricsAggregatedData = async (aggregationType) => {
  const { data } = await axios.get(`/metrics/aggregated-data`, {
    params: { aggregationType }
  });
  return data;
}
export const getMetricsByCustomQuery = async (query) => {
  const { data } = await axios.post(`/metrics/custom-query`, query);
  return data;
}
export const getMetricsByMultipleCriteria = async (criteria) => {
  const { data } = await axios.post(`/metrics/multiple-criteria`, criteria);
  return data;
}
export const getMetricsByAdvancedFilter = async (filter) => {
  const { data } = await axios.post(`/metrics/advanced-filter`, filter);
  return data;
}
export const getMetricsByDate = async (date) => {
  const { data } = await axios.get(`/metrics/date/${date}`);
  return data;
}
export const getMetricsByTime = async (time) => {
  const { data } = await axios.get(`/metrics/time/${time}`);
  return data;
}
export const getMetricsByDateTimeRange = async (startDateTime, endDateTime) => {
  const { data } = await axios.get(`/metrics/date-time-range`, {
    params: {
      startDateTime,
      endDateTime
    }
  });
  return data;
}
export const getMetricsByCustomDateRange = async (startDate, endDate) => {
  const { data } = await axios.get(`/metrics/custom-date-range`, {
    params: {
      startDate,
      endDate
    }
  });
  return data;
}