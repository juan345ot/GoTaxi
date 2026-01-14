const request = require('supertest');
const path = require('path');

let cachedApp;

/**
 * Obtiene una instancia de la aplicación para pruebas.
 *
 * Carga el archivo src/app.js o el módulo indicado en la variable de
 * entorno TEST_APP_PATH. Si el módulo exporta un objeto con la
 * propiedad `default`, se utiliza como aplicación (soporta módulos ESM
 * compilados a CommonJS). La instancia se mantiene en caché para
 * evitar recargas innecesarias en cada llamada.
 *
 * @returns {Function} Objeto SuperTest configurado para la app
 */
function getApp() {
  if (!cachedApp) {
    const defaultPath = path.resolve(__dirname, '../../src/app.js');
    const appPath = process.env.TEST_APP_PATH || defaultPath;
    // Cargar la app; soporta default export (ESM) y export común
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const imported = require(appPath);
    cachedApp = imported.default || imported;
  }
  return request(cachedApp);
}

module.exports = { getApp };
