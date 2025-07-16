import axios from "./axiosInstance";

export const getDrivers = async () => {
  const { data } = await axios.get('/drivers');
  return data;
};

export const approveDriver = async (id, promo = false) => {
  const { data } = await axios.put(`/drivers/${id}/approve`, { promo });
  return data;
};

export const rejectDriver = async (id) => {
  const { data } = await axios.put(`/drivers/${id}/reject`);
  return data;
};

export const updateDriverCommission = async (id, commission) => {
  const { data } = await axios.put(`/drivers/${id}/commission`, { commission });
  return data;
};

export const updateDriverStatus = async (id, status) => {
  const { data } = await axios.put(`/drivers/${id}/status`, { status });
  return data;
};

export const getDriverById = async (id) => {
  const { data } = await axios.get(`/drivers/${id}`);
  return data;
};

export const getDriverStats = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/stats`);
  return data;
}   
export const getDriverEarnings = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/earnings`);
  return data;
}
export const getDriverTrips = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/trips`);
  return data;
}
export const getDriverVehicles = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/vehicles`);
  return data;
} 
export const getDriverDocuments = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/documents`);
  return data;
}
export const uploadDriverDocument = async (id, document) => {   
  const formData = new FormData();
  formData.append('document', document);
  const { data } = await axios.post(`/drivers/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}
export const deleteDriverDocument = async (id, documentId) => {
  const { data } = await axios.delete(`/drivers/${id}/documents/${documentId}`);
  return data;
}

export const getDriverRatings = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/ratings`);
  return data;
}   

export const getDriverReviews = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/reviews`);
  return data;
}

export const getDriverPromotions = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/promotions`);
  return data;
}

export const createDriverPromotion = async (id, promotion) => {
  const { data } = await axios.post(`/drivers/${id}/promotions`, promotion);
  return data;
}

export const updateDriverPromotion = async (id, promotionId, promotion) => {
  const { data } = await axios.put(`/drivers/${id}/promotions/${promotionId}`, promotion);
  return data;
}

export const deleteDriverPromotion = async (id, promotionId) => {
  const { data } = await axios.delete(`/drivers/${id}/promotions/${promotionId}`);
  return data;
}

export const getDriverNotifications = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/notifications`);
  return data;
}

export const markDriverNotificationAsRead = async (id, notificationId) => {
  const { data } = await axios.put(`/drivers/${id}/notifications/${notificationId}/read`);
  return data;
}

export const deleteDriverNotification = async (id, notificationId) => {
  const { data } = await axios.delete(`/drivers/${id}/notifications/${notificationId}`);
  return data;
}
export const getDriverSettings = async (id) => {
  const { data } = await axios.get(`/drivers/${id}/settings`);
  return data;
}
