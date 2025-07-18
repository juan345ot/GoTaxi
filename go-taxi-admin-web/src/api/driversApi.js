import axios from "./axiosInstance";

/** Helper para GET */
const apiGet = async (url, params = {}) => {
  try {
    const { data } = await axios.get(url, { params });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al consultar recurso" };
  }
};

/** Helper para POST */
const apiPost = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al crear recurso" };
  }
};

/** Helper para PUT */
const apiPut = async (url, payload) => {
  try {
    const { data } = await axios.put(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar recurso" };
  }
};

/** Helper para DELETE */
const apiDelete = async (url) => {
  try {
    const { data } = await axios.delete(url);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al eliminar recurso" };
  }
};

// ============================
// Métodos principales Drivers
// ============================

export const getDrivers = (params = {}) => apiGet("/drivers", params);

export const approveDriver = (id, promo = false) => apiPut(`/drivers/${id}/approve`, { promo });
export const rejectDriver = (id) => apiPut(`/drivers/${id}/reject`);
export const updateDriverCommission = (id, commission) => apiPut(`/drivers/${id}/commission`, { commission });
export const updateDriverStatus = (id, status) => apiPut(`/drivers/${id}/status`, { status });

export const getDriverById = (id) => apiGet(`/drivers/${id}`);
export const getDriverStats = (id) => apiGet(`/drivers/${id}/stats`);
export const getDriverEarnings = (id) => apiGet(`/drivers/${id}/earnings`);
export const getDriverTrips = (id) => apiGet(`/drivers/${id}/trips`);
export const getDriverVehicles = (id) => apiGet(`/drivers/${id}/vehicles`);
export const getDriverDocuments = (id) => apiGet(`/drivers/${id}/documents`);

export const uploadDriverDocument = async (id, document) => {
  if (!document) return { error: "Documento faltante" };
  try {
    const formData = new FormData();
    formData.append('document', document);
    const { data } = await axios.post(`/drivers/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al subir documento" };
  }
};

export const deleteDriverDocument = (id, documentId) =>
  apiDelete(`/drivers/${id}/documents/${documentId}`);

export const getDriverRatings = (id) => apiGet(`/drivers/${id}/ratings`);
export const getDriverReviews = (id) => apiGet(`/drivers/${id}/reviews`);

export const getDriverPromotions = (id) => apiGet(`/drivers/${id}/promotions`);
export const createDriverPromotion = (id, promotion) => apiPost(`/drivers/${id}/promotions`, promotion);
export const updateDriverPromotion = (id, promotionId, promotion) => apiPut(`/drivers/${id}/promotions/${promotionId}`, promotion);
export const deleteDriverPromotion = (id, promotionId) => apiDelete(`/drivers/${id}/promotions/${promotionId}`);

export const getDriverNotifications = (id) => apiGet(`/drivers/${id}/notifications`);
export const markDriverNotificationAsRead = (id, notificationId) =>
  apiPut(`/drivers/${id}/notifications/${notificationId}/read`);
export const deleteDriverNotification = (id, notificationId) =>
  apiDelete(`/drivers/${id}/notifications/${notificationId}`);

export const getDriverSettings = (id) => apiGet(`/drivers/${id}/settings`);

/*
// Ejemplo TEST UNITARIO (con Jest)
import { getDrivers } from './driversApi';
test('getDrivers: debe devolver array', async () => {
  const res = await getDrivers();
  expect(Array.isArray(res.data)).toBe(true);
});
*/

