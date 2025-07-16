import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const getRates = () => axios.get(`${API_URL}/rates`);
export const updateRates = (rates) => axios.put(`${API_URL}/rates`, rates);
