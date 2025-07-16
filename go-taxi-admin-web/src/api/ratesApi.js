import axios from "./axiosInstance";

export const getRates = async () => {
  const { data } = await axios.get('/rates');
  return data;
};

export const updateRates = async (rates) => {
  const { data } = await axios.put('/rates', rates);
  return data;
};
export const createRate = async (rate) => {
  const { data } = await axios.post('/rates', rate);
  return data;
};
export const deleteRate = async (id) => {
  const { data } = await axios.delete(`/rates/${id}`);
  return data;
};
export const getRateById = async (id) => {
  const { data } = await axios.get(`/rates/${id}`);
  return data;
}
export const updateRate = async (id, rate) => {
  const { data } = await axios.put(`/rates/${id}`, rate);
  return data;
}
export const getRatesByType = async (type) => {
  const { data } = await axios.get(`/rates/type/${type}`);
  return data;
}
export const getRatesByVehicleType = async (vehicleType) => {
  const { data } = await axios.get(`/rates/vehicleType/${vehicleType}`);
  return data;
}
export const getRatesByCompany = async (companyId) => {
  const { data } = await axios.get(`/rates/company/${companyId}`);
  return data;
}
export const getRatesByCompanyAndType = async (companyId, type) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}`);
  return data;
}
export const getRatesByCompanyAndVehicleType = async (companyId, vehicleType) => {
  const { data } = await axios.get(`/rates/company/${companyId}/vehicleType/${vehicleType}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleType = async (companyId, type, vehicleType) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndId = async (companyId, type, vehicleType, id) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatus = async (companyId, type, vehicleType, id, status) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDate = async (companyId, type, vehicleType, id, status, date) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTime = async (companyId, type, vehicleType, id, status, date, time) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUser = async (companyId, type, vehicleType, id, status, date, time, userId) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriver = async (companyId, type, vehicleType, id, status, date, time, userId, driverId) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicle = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocation = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPrice = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrency = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrencyAndPaymentMethod = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency, paymentMethod) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}/paymentMethod/${paymentMethod}`);
  return data;
}
export const getRatesByCompanyAndTypeAndVehicleTypeAndIdAndStatusAndDateAndTimeAndUserAndDriverAndVehicleAndLocationAndPriceAndCurrencyAndPaymentMethodAndDiscount = async (companyId, type, vehicleType, id, status, date, time, userId, driverId, vehicleId, location, price, currency, paymentMethod, discount) => {
  const { data } = await axios.get(`/rates/company/${companyId}/type/${type}/vehicleType/${vehicleType}/id/${id}/status/${status}/date/${date}/time/${time}/user/${userId}/driver/${driverId}/vehicle/${vehicleId}/location/${location}/price/${price}/currency/${currency}/paymentMethod/${paymentMethod}/discount/${discount}`);
  return data;
}
