import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginAdmin = (credentials) => axios.post(`${API_URL}/auth/admin/login`, credentials);
