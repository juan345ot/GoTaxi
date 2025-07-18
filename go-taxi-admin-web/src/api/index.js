// src/api/index.js
// Barrel file: Permite importar endpoints desde un solo lugar.
// Ejemplo: import { getDrivers, loginAdmin } from 'src/api';

export * from './authApi';
export * from './driversApi';
export * from './complaintsApi';
export * from './metricsApi';
export * from './ratesApi';

// Si agregás nuevos módulos de API, exportalos aquí también.
// Ejemplo:
// export * from './socketApi';
