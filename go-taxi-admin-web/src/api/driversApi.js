import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const getDrivers = () => axios.get(`${API_URL}/drivers`);
export const approveDriver = (id, promo = false) => axios.put(`${API_URL}/drivers/${id}/approve`, { promo });
export const rejectDriver = (id) => axios.put(`${API_URL}/drivers/${id}/reject`);
