import axios from "./axiosInstance";

export const getComplaints = async () => {
  const { data } = await axios.get('/complaints');
  return data;
};

export const resolveComplaint = async (id) => {
  const { data } = await axios.put(`/complaints/${id}/resolve`);
  return data;
};
export const rejectComplaint = async (id) => {
  const { data } = await axios.put(`/complaints/${id}/reject`);
  return data;
};
export const getComplaintDetails = async (id) => {
  const { data } = await axios.get(`/complaints/${id}`);
  return data;
}
export const getComplaintByUser = async (userId) => {
  const { data } = await axios.get(`/complaints/user/${userId}`);
  return data;
}
export const getComplaintByDriver = async (driverId) => {
  const { data } = await axios.get(`/complaints/driver/${driverId}`);
  return data;
}
export const getComplaintByTaxi = async (taxiId) => {
  const { data } = await axios.get(`/complaints/taxi/${taxiId}`);
  return data;
}
export const getComplaintByTrip = async (tripId) => {
  const { data } = await axios.get(`/complaints/trip/${tripId}`);
  return data;
}
export const createComplaint = async (complaintData) => {
  const { data } = await axios.post('/complaints', complaintData);
  return data;
}
export const updateComplaint = async (id, complaintData) => {
  const { data } = await axios.put(`/complaints/${id}`, complaintData);
  return data;
}
export const deleteComplaint = async (id) => {
  const { data } = await axios.delete(`/complaints/${id}`);
  return data;
}
export const getComplaintTypes = async () => {
  const { data } = await axios.get('/complaints/types');
  return data;
}
export const createComplaintType = async (typeData) => {
  const { data } = await axios.post('/complaints/types', typeData);
  return data;
}
export const updateComplaintType = async (id, typeData) => {
  const { data } = await axios.put(`/complaints/types/${id}`, typeData);
  return data;
}
export const deleteComplaintType = async (id) => {
  const { data } = await axios.delete(`/complaints/types/${id}`);
  return data;
}
export const getComplaintStatus = async () => {
  const { data } = await axios.get('/complaints/status');
  return data;
}
export const createComplaintStatus = async (statusData) => {
  const { data } = await axios.post('/complaints/status', statusData);
  return data;
}
export const updateComplaintStatus = async (id, statusData) => {
  const { data } = await axios.put(`/complaints/status/${id}`, statusData);
  return data;
}
export const deleteComplaintStatus = async (id) => {
  const { data } = await axios.delete(`/complaints/status/${id}`);
  return data;
} 
export const getComplaintHistory = async (id) => {
  const { data } = await axios.get(`/complaints/${id}/history`);
  return data;
}   
export const getComplaintStatistics = async () => {
  const { data } = await axios.get('/complaints/statistics');
  return data;
}
export const getComplaintByDateRange = async (startDate, endDate) => {
  const { data } = await axios.get(`/complaints/date-range`, {
    params: { startDate, endDate }
  });
  return data;
}
export const getComplaintByStatus = async (status) => {
  const { data } = await axios.get(`/complaints/status/${status}`);
  return data;
}
export const getComplaintByType = async (type) => {
  const { data } = await axios.get(`/complaints/type/${type}`);
  return data;
}
export const getComplaintByUserAndStatus = async (userId, status) => {
  const { data } = await axios.get(`/complaints/user/${userId}/status/${status}`);
  return data;
}
export const getComplaintByDriverAndStatus = async (driverId, status) => {
  const { data } = await axios.get(`/complaints/driver/${driverId}/status/${status}`);
  return data;
}
export const getComplaintByTaxiAndStatus = async (taxiId, status) => {
  const { data } = await axios.get(`/complaints/taxi/${taxiId}/status/${status}`);
  return data;
}
export const getComplaintByTripAndStatus = async (tripId, status) => {
  const { data } = await axios.get(`/complaints/trip/${tripId}/status/${status}`);
  return data;
}
export const getComplaintByUserAndType = async (userId, type) => {
  const { data } = await axios.get(`/complaints/user/${userId}/type/${type}`);
  return data;
}
export const getComplaintByDriverAndType = async (driverId, type) => {
  const { data } = await axios.get(`/complaints/driver/${driverId}/type/${type}`);
  return data;
}
