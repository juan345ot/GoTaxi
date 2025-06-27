import axios from 'axios';
import config from '../config';

const httpClient = axios.create({
  baseURL: config.API_URL,
  timeout: 5000,
});

export default httpClient;