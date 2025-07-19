import axios from "./axiosInstance";

/** Helper para GET */
const apiGet = async (url, params = {}) => {
  try {
    const { data } = await axios.get(url, { params });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al consultar pasajeros" };
  }
};

/** Helper para POST */
const apiPost = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al crear pasajero" };
  }
};

/** Helper para PUT */
const apiPut = async (url, payload) => {
  try {
    const { data } = await axios.put(url, payload);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar pasajero" };
  }
};

/** Helper para DELETE */
const apiDelete = async (url) => {
  try {
    const { data } = await axios.delete(url);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al eliminar pasajero" };
  }
};

/**
 * Obtener lista de pasajeros (opcional: params para paginación/filtros)
 * @param {object} params
 */
export const getPassengers = (params = {}) => apiGet("/passengers", params);

/**
 * Aprobar pasajero por ID
 * @param {string|number} id
 */
export const approvePassenger = (id) => apiPut(`/passengers/${id}/approve`);

/**
 * Rechazar pasajero por ID
 * @param {string|number} id
 */
export const rejectPassenger = (id) => apiPut(`/passengers/${id}/reject`);

/**
 * Eliminar pasajero por ID
 * @param {string|number} id
 */
export const deletePassenger = (id) => apiDelete(`/passengers/${id}`);

/**
 * Obtener un pasajero por ID
 * @param {string|number} id
 */
export const getPassenger = (id) => apiGet(`/passengers/${id}`);

/**
 * Actualizar pasajero por ID
 * @param {string|number} id
 * @param {object} payload
 */
export const updatePassenger = (id, payload) => apiPut(`/passengers/${id}`, payload);

// Export para uso directo o con import *
export default {
  getPassengers,
  approvePassenger,
  rejectPassenger,
  deletePassenger,
  getPassenger,
  updatePassenger,
};

/*
// Ejemplo TEST UNITARIO (con Jest)
import { getPassengers } from './passengersApi';
test('getPassengers: debería retornar array o error', async () => {
  const res = await getPassengers();
  expect(res.data || res.error).toBeDefined();
});
*/
