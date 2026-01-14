const fs = require('fs');
const path = require('path');
const { formatDate } = require('./date');

/*
 * Servicio de logging para GoTaxi (utilidades generales).
 *
 * Este módulo proporciona una función `logToFile` que añade entradas a un
 * archivo de log con un timestamp ISO, de forma sencilla y sin dependencias
 * externas. El directorio y el nombre de archivo se pueden configurar
 * mediante las variables de entorno LOG_DIR y LOG_FILE; en ausencia de
 * configuración, por defecto se utilizarán las rutas `./logs` y `app.log`.
 *
 * La intención es separar la lógica de log de la capa de middleware HTTP
 * (que está gestionada por morgan) y proporcionar una forma consistente de
 * registrar eventos de negocio, auditorías o errores en distintas capas.
 */

// Directorio de logs configurable via variable de entorno, relativo a la raíz del proyecto
const logDir = process.env.LOG_DIR || path.join(__dirname, '../logs');
// Nombre del archivo de log (por defecto app.log)
const logFile = process.env.LOG_FILE || 'app.log';

/**
 * Escribe un mensaje en el archivo de log con fecha y hora.
 *
 * Se asegura de crear el directorio de logs si no existe. En caso de error
 * al crear el directorio o escribir el archivo, se captura la excepción y
 * se muestra por consola, evitando que la aplicación se caiga.
 *
 * @param {string} message Mensaje a registrar
 */
function logToFile(message) {
  const timestamp = formatDate(new Date());
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const filePath = path.join(logDir, logFile);
    fs.appendFileSync(filePath, logMessage, 'utf8');
  } catch (err) {
    // En caso de fallo al escribir en disco, loggear a consola como último recurso
    // eslint-disable-next-line no-console
    console.error('Error escribiendo log:', err);
  }
}

module.exports = { logToFile };
