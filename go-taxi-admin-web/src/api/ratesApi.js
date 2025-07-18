import axios from "./axiosInstance";

/** Helper para GET */
const apiGet = async (url, params = {}) => {
  try {
    const { data } = await axios.get(url, { params });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al consultar tarifas" };
  }
};

/** Helper para POST */
const apiPost = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al crear tarifa" };
  }
};

/** Helper para PUT */
const apiPut = async (url, payload) => {
  try {
    const { data } = await axios.put(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar tarifa" };
  }
};

/** Helper para DELETE */
const apiDelete = async (url) => {
  try {
    const { data } = await axios.delete(url);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al eliminar tarifa" };
  }
};

// ============= FUNCIONES PRINCIPALES RATES =============

export const getRates = (params = {}) => apiGet('/rates', params);
export const updateRates = (rates) => apiPut('/rates', rates);
export const createRate = (rate) => apiPost('/rates', rate);
export const deleteRate = (id) => apiDelete(`/rates/${id}`);
export const getRateById = (id) => apiGet(`/rates/${id}`);
export const updateRate = (id, rate) => apiPut(`/rates/${id}`, rate);

// ============= FILTROS Y BUSQUEDAS AVANZADAS =============

export const getRatesByType = (type) => apiGet(`/rates/type/${type}`);
export const getRatesByVehicleType = (vehicleType) => apiGet(`/rates/vehicleType/${vehicleType}`);
export const getRatesByCompany = (companyId) => apiGet(`/rates/company/${companyId}`);
export const getRatesByCompanyAndType = (companyId, type) => apiGet(`/rates/company/${companyId}/type/${type}`);
export const getRatesByCompanyAndVehicleType = (companyId, vehicleType) => apiGet(`/rates/company/${companyId}/vehicleType/${vehicleType}`);
export const getRatesByCompanyAndTypeAndVehicleType = (companyId, type, vehicleType) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndId = (companyId, type, vehicleType, id) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatus = (companyId, type, vehicleType, id, status) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDate = (companyId, type, vehicleType, id, status, date) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTime = (companyId, type, vehicleType, id, status, date, time) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUser = (companyId, type, vehicleType, id, status, date, time, userId) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriver = (companyId, type, vehicleType, id, status, date, time, userId, driverId) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicle = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocation = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPrice = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrency = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrencyAndPaymentMethod = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency, paymentMethod) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}/paymentMethod/${paymentMethod}`);
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrencyAndPaymentMethodAndDiscount = (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency, paymentMethod, discount) => apiGet(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}/paymentMethod/${paymentMethod}/discount/${discount}`);

/*
// Ejemplo TEST UNITARIO (con Jest)
import { getRates } from './ratesApi';
test('getRates: debe devolver array o error', async () => {
  const res = await getRates();
  expect(res.data || res.error).toBeDefined();
});
*/

