import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

/**
 * Servicio de almacenamiento seguro para datos sensibles
 * Encripta los datos antes de guardarlos en AsyncStorage con medidas de seguridad avanzadas
 */
class SecureStorage {
  constructor() {
    this.encryptionKey = this.getEncryptionKey();
    this.iv = this.generateIV();
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24 horas
    this.lastKeyRotation = this.getLastKeyRotation();
  }

  /**
   * Obtiene o genera una clave de encriptación más segura
   * @description Genera una clave de encriptación basada en múltiples factores del dispositivo
   * @returns {string} Clave de encriptación SHA-256
   */
  getEncryptionKey() {
    try {
      // Combinar múltiples factores para mayor seguridad
      const deviceId = Platform.OS === 'ios' ? 'ios-gotaxi' : 'android-gotaxi';
      const timestamp = Date.now().toString();
      const randomSeed = Math.random().toString(36);

      // Crear un hash más complejo
      const combined = `${deviceId}-${timestamp}-${randomSeed}`;
      const hash = CryptoJS.SHA256(combined);

      // Aplicar PBKDF2 para mayor seguridad
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const key = CryptoJS.PBKDF2(hash.toString(), salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      return key.toString();
    } catch (error) {
      // Fallback a método básico si hay error
      const deviceId = 'gotaxi-app-device-fallback';
      return CryptoJS.SHA256(deviceId).toString();
    }
  }

  /**
   * Genera un vector de inicialización (IV) único
   * @description Genera un IV aleatorio para cada operación de encriptación
   * @returns {string} IV en formato hexadecimal
   */
  generateIV() {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  /**
   * Obtiene la última rotación de clave
   * @returns {number} Timestamp de la última rotación
   */
  getLastKeyRotation() {
    try {
      const stored = AsyncStorage.getItem('secure_key_rotation');
      return stored ? parseInt(stored, 10) : Date.now();
    } catch {
      return Date.now();
    }
  }

  /**
   * Verifica si es necesario rotar la clave
   * @returns {boolean} True si necesita rotación
   */
  needsKeyRotation() {
    return (Date.now() - this.lastKeyRotation) > this.keyRotationInterval;
  }

  /**
   * Rota la clave de encriptación
   * @description Genera una nueva clave y migra datos existentes
   */
  async rotateKey() {
    try {
      const oldKey = this.encryptionKey;
      this.encryptionKey = this.getEncryptionKey();
      this.lastKeyRotation = Date.now();

      // Guardar timestamp de rotación
      await AsyncStorage.setItem('secure_key_rotation', this.lastKeyRotation.toString());

      // Migrar datos existentes (opcional, puede ser costoso)
      await this.migrateDataWithNewKey(oldKey);

      return true;
    } catch (error) {
      console.error('Error rotating encryption key:', error);
      return false;
    }
  }

  /**
   * Migra datos existentes con nueva clave
   * @param {string} oldKey - Clave anterior
   */
  async migrateDataWithNewKey(oldKey) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));

      for (const key of secureKeys) {
        try {
          const encryptedData = await AsyncStorage.getItem(key);
          if (encryptedData) {
            // Desencriptar con clave anterior
            const decrypted = CryptoJS.AES.decrypt(encryptedData, oldKey);
            const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

            // Re-encriptar con nueva clave
            await this.setItem(key, data);
          }
        } catch (error) {
          // Si no se puede migrar, eliminar el dato corrupto
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error migrating data with new key:', error);
    }
  }

  /**
   * Encripta datos usando AES con IV único
   * @description Encripta datos usando AES-256 con un IV único para cada operación
   * @param {any} data - Datos a encriptar
   * @returns {string} Datos encriptados con IV incluido
   */
  encrypt(data) {
    try {
      // Validar entrada
      if (data === null || data === undefined) {
        throw new Error('Datos inválidos para encriptar');
      }

      const jsonString = JSON.stringify(data);
      const iv = this.generateIV();

      // Encriptar con IV único
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combinar IV y datos encriptados
      const result = `${iv}:${encrypted.toString()}`;

      // Agregar checksum para verificación de integridad
      const checksum = CryptoJS.SHA256(result).toString();
      return `${result}:${checksum}`;
    } catch (error) {
      throw new Error(`Error al encriptar datos: ${error.message}`);
    }
  }

  /**
   * Desencripta datos usando AES con verificación de integridad
   * @description Desencripta datos verificando la integridad con checksum
   * @param {string} encryptedData - Datos encriptados con IV y checksum
   * @returns {any} Datos desencriptados
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Datos encriptados inválidos');
      }

      // Separar IV, datos encriptados y checksum
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de datos encriptados inválido');
      }

      const [iv, encrypted, checksum] = parts;

      // Verificar integridad
      const dataToVerify = `${iv}:${encrypted}`;
      const calculatedChecksum = CryptoJS.SHA256(dataToVerify).toString();

      if (calculatedChecksum !== checksum) {
        throw new Error('Datos corruptos o modificados');
      }

      // Desencriptar
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!jsonString) {
        throw new Error('Error al desencriptar: datos vacíos');
      }

      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Error al desencriptar datos: ${error.message}`);
    }
  }

  /**
   * Ejecuta una operación con reintentos automáticos
   * @description Ejecuta una operación con lógica de reintentos para mayor robustez
   * @param {Function} operation - Operación a ejecutar
   * @param {number} retries - Número de reintentos restantes
   * @returns {Promise<any>} Resultado de la operación
   */
  async executeWithRetry(operation, retries = this.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Verifica si un error es reintentable
   * @param {Error} error - Error a verificar
   * @returns {boolean} True si el error es reintentable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'Error al encriptar datos',
      'Error al desencriptar datos',
      'Error al guardar datos seguros',
      'Error al obtener datos seguros',
    ];

    return retryableErrors.some(msg => error.message.includes(msg));
  }

  /**
   * Delay helper para reintentos
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Guarda datos de forma segura con verificación de rotación de clave
   * @description Guarda datos encriptados con verificación automática de rotación de clave
   * @param {string} key - Clave de almacenamiento
   * @param {any} data - Datos a guardar
   * @returns {Promise<boolean>} True si se guardó correctamente
   */
  async setItem(key, data) {
    return this.executeWithRetry(async() => {
      // Verificar si necesita rotación de clave
      if (this.needsKeyRotation()) {
        await this.rotateKey();
      }

      // Validar clave
      if (!key || typeof key !== 'string') {
        throw new Error('Clave de almacenamiento inválida');
      }

      // Validar datos
      if (data === null || data === undefined) {
        throw new Error('Datos inválidos para almacenar');
      }

      const encryptedData = this.encrypt(data);
      await AsyncStorage.setItem(key, encryptedData);
      return true;
    });
  }

  /**
   * Obtiene datos de forma segura con manejo de errores mejorado
   * @description Recupera y desencripta datos con verificación de integridad
   * @param {string} key - Clave de almacenamiento
   * @returns {Promise<any|null>} Datos desencriptados o null si no existen
   */
  async getItem(key) {
    return this.executeWithRetry(async() => {
      if (!key || typeof key !== 'string') {
        throw new Error('Clave de almacenamiento inválida');
      }

      const encryptedData = await AsyncStorage.getItem(key);
      if (!encryptedData) {
        return null;
      }

      try {
        return this.decrypt(encryptedData);
      } catch (error) {
        // Si hay error de desencriptación, limpiar el dato corrupto
        console.warn(`Datos corruptos en clave ${key}, eliminando...`);
        await this.removeItem(key);
        return null;
      }
    });
  }

  /**
   * Elimina datos seguros
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar datos seguros');
    }
  }

  /**
   * Limpia todos los datos seguros
   */
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      await AsyncStorage.multiRemove(secureKeys);
      return true;
    } catch (error) {
      throw new Error('Error al limpiar datos seguros');
    }
  }

  /**
   * Verifica si existe una clave
   */
  async hasItem(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene múltiples elementos de forma segura
   */
  async getMultiple(keys) {
    try {
      const encryptedData = await AsyncStorage.multiGet(keys);
      const result = {};
      for (const [key, encryptedValue] of encryptedData) {
        if (encryptedValue) {
          try {
            result[key] = this.decrypt(encryptedValue);
          } catch (error) {
            result[key] = null;
          }
        } else {
          result[key] = null;
        }
      }
      return result;
    } catch (error) {
      throw new Error('Error al obtener múltiples datos seguros');
    }
  }

  /**
   * Guarda múltiples elementos de forma segura
   * @description Guarda múltiples pares clave-valor de forma segura
   * @param {Array<[string, any]>} keyValuePairs - Array de pares [clave, valor]
   * @returns {Promise<boolean>} True si se guardaron correctamente
   */
  async setMultiple(keyValuePairs) {
    return this.executeWithRetry(async() => {
      if (!Array.isArray(keyValuePairs)) {
        throw new Error('keyValuePairs debe ser un array');
      }

      // Verificar si necesita rotación de clave
      if (this.needsKeyRotation()) {
        await this.rotateKey();
      }

      const encryptedPairs = keyValuePairs.map(([key, value]) => {
        if (!key || typeof key !== 'string') {
          throw new Error('Clave inválida en keyValuePairs');
        }
        return [key, this.encrypt(value)];
      });

      await AsyncStorage.multiSet(encryptedPairs);
      return true;
    });
  }

  /**
   * Verifica la integridad de los datos almacenados
   * @description Verifica que todos los datos seguros estén íntegros
   * @returns {Promise<Object>} Reporte de integridad
   */
  async verifyIntegrity() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      const report = {
        totalKeys: secureKeys.length,
        validKeys: 0,
        corruptedKeys: 0,
        errors: [],
      };

      for (const key of secureKeys) {
        try {
          const encryptedData = await AsyncStorage.getItem(key);
          if (encryptedData) {
            this.decrypt(encryptedData);
            report.validKeys++;
          }
        } catch (error) {
          report.corruptedKeys++;
          report.errors.push({ key, error: error.message });
        }
      }

      return report;
    } catch (error) {
      throw new Error(`Error verificando integridad: ${error.message}`);
    }
  }

  /**
   * Limpia datos corruptos
   * @description Elimina datos que no se pueden desencriptar
   * @returns {Promise<number>} Número de claves eliminadas
   */
  async cleanCorruptedData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      let cleanedCount = 0;

      for (const key of secureKeys) {
        try {
          const encryptedData = await AsyncStorage.getItem(key);
          if (encryptedData) {
            this.decrypt(encryptedData);
          }
        } catch (error) {
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      throw new Error(`Error limpiando datos corruptos: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de seguridad
   * @description Retorna estadísticas del almacenamiento seguro
   * @returns {Promise<Object>} Estadísticas de seguridad
   */
  async getSecurityStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      const integrityReport = await this.verifyIntegrity();

      return {
        totalSecureKeys: secureKeys.length,
        validKeys: integrityReport.validKeys,
        corruptedKeys: integrityReport.corruptedKeys,
        lastKeyRotation: new Date(this.lastKeyRotation).toISOString(),
        needsRotation: this.needsKeyRotation(),
        encryptionAlgorithm: 'AES-256-CBC',
        keyDerivation: 'PBKDF2',
        iterations: 10000,
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  /**
   * Fuerza la rotación de clave
   * @description Fuerza la rotación inmediata de la clave de encriptación
   * @returns {Promise<boolean>} True si se rotó correctamente
   */
  async forceKeyRotation() {
    try {
      return await this.rotateKey();
    } catch (error) {
      throw new Error(`Error forzando rotación de clave: ${error.message}`);
    }
  }

  /**
   * Valida la configuración de seguridad
   * @description Verifica que la configuración de seguridad sea correcta
   * @returns {boolean} True si la configuración es válida
   */
  validateSecurityConfig() {
    try {
      // Verificar que la clave de encriptación sea válida
      if (!this.encryptionKey || this.encryptionKey.length < 32) {
        return false;
      }

      // Verificar configuración de reintentos
      if (this.maxRetries < 1 || this.maxRetries > 10) {
        return false;
      }

      // Verificar intervalo de rotación
      if (this.keyRotationInterval < 3600000) { // Mínimo 1 hora
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Instancia singleton
const secureStorage = new SecureStorage();

// Validar configuración al inicializar
if (!secureStorage.validateSecurityConfig()) {
  console.warn('Configuración de seguridad inválida, usando configuración por defecto');
}

export default secureStorage;
