import axios from "./axiosInstance";

/**
 * Helper para llamadas GET.
 */
const apiGet = async (url, params = {}) => {
  try {
    const { data } = await axios.get(url, { params });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al consultar el recurso" };
  }
};

/**
 * Helper para llamadas POST.
 */
const apiPost = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al crear el recurso" };
  }
};

/**
 * Helper para llamadas PUT.
 */
const apiPut = async (url, payload) => {
  try {
    const { data } = await axios.put(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar el recurso" };
  }
};

/**
 * Helper para llamadas DELETE.
 */
const apiDelete = async (url) => {
  try {
    const { data } = await axios.delete(url);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al eliminar el recurso" };
  }
};

// Métodos principales

export const getComplaints = (params = {}) => apiGet('/complaints', params);

export const resolveComplaint = (id) => apiPut(`/complaints/${id}/resolve`);
export const rejectComplaint = (id) => apiPut(`/complaints/${id}/reject`);

export const getComplaintDetails = (id) => apiGet(`/complaints/${id}`);
export const getComplaintByUser = (userId) => apiGet(`/complaints/user/${userId}`);
export const getComplaintByDriver = (driverId) => apiGet(`/complaints/driver/${driverId}`);
export const getComplaintByTaxi = (taxiId) => apiGet(`/complaints/taxi/${taxiId}`);
export const getComplaintByTrip = (tripId) => apiGet(`/complaints/trip/${tripId}`);

export const createComplaint = (complaintData) => apiPost('/complaints', complaintData);
export const updateComplaint = (id, complaintData) => apiPut(`/complaints/${id}`, complaintData);
export const deleteComplaint = (id) => apiDelete(`/complaints/${id}`);

export const getComplaintTypes = () => apiGet('/complaints/types');
export const createComplaintType = (typeData) => apiPost('/complaints/types', typeData);
export const updateComplaintType = (id, typeData) => apiPut(`/complaints/types/${id}`, typeData);
export const deleteComplaintType = (id) => apiDelete(`/complaints/types/${id}`);

export const getComplaintStatus = () => apiGet('/complaints/status');
export const createComplaintStatus = (statusData) => apiPost('/complaints/status', statusData);
export const updateComplaintStatus = (id, statusData) => apiPut(`/complaints/status/${id}`, statusData);
export const deleteComplaintStatus = (id) => apiDelete(`/complaints/status/${id}`);

export const getComplaintHistory = (id) => apiGet(`/complaints/${id}/history`);
export const getComplaintStatistics = () => apiGet('/complaints/statistics');

export const getComplaintByDateRange = (startDate, endDate) => 
  apiGet(`/complaints/date-range`, { startDate, endDate });

export const getComplaintByStatus = (status) => apiGet(`/complaints/status/${status}`);
export const getComplaintByType = (type) => apiGet(`/complaints/type/${type}`);

export const getComplaintByUserAndStatus = (userId, status) => apiGet(`/complaints/user/${userId}/status/${status}`);
export const getComplaintByDriverAndStatus = (driverId, status) => apiGet(`/complaints/driver/${driverId}/status/${status}`);
export const getComplaintByTaxiAndStatus = (taxiId, status) => apiGet(`/complaints/taxi/${taxiId}/status/${status}`);
export const getComplaintByTripAndStatus = (tripId, status) => apiGet(`/complaints/trip/${tripId}/status/${status}`);

export const getComplaintByUserAndType = (userId, type) => apiGet(`/complaints/user/${userId}/type/${type}`);
export const getComplaintByDriverAndType = (driverId, type) => apiGet(`/complaints/driver/${driverId}/type/${type}`);

// Si tu backend soporta WebSocket para reclamos:
// export const subscribeComplaintsWS = (cb) => { ... } // Implementación a futuro

/*
-------------------------
// TEST UNITARIO (ejemplo con Jest)
import { getComplaints } from './complaintsApi';
test('getComplaints: debería retornar array', async () => {
  const res = await getComplaints();
  expect(Array.isArray(res.data)).toBe(true);
});
-------------------------
*/

