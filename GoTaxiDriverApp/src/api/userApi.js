import axios from './axiosInstance';

export async function getDriverProfile() {
  return { nombre: "Juan", email: "conductor@gotaxi.com", foto: null, documentos: [] };
}
