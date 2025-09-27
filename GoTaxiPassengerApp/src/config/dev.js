import { Platform } from 'react-native';

// ⚠️ Cambiá esto por la IP de tu PC en la LAN (ipconfig / ifconfig)
const LAN_IP = '192.168.1.111';
const PORT = 4000;

/**
 * Android emulador = usa 10.0.2.2 (mappea al localhost de tu PC)
 * Teléfono físico = usa la IP LAN de tu PC (misma Wi-Fi)
 */
const USE_ANDROID_EMULATOR = false; // true si usás el emulador de Android, false para teléfono físico

// Origen HTTP base (sin /api)
const ORIGIN =
  Platform.OS === 'android' && USE_ANDROID_EMULATOR
    ? `http://10.0.2.2:${PORT}`
    : `http://${LAN_IP}:${PORT}`;

// Helper para derivar ws:// ó wss:// desde el ORIGIN
const toWS = (url) => url.replace(/^http(s)?:\/\//, (m, s) => (s ? 'wss://' : 'ws://'));

export default {
  ENV: 'development',
  // ✅ Tu backend expone los endpoints bajo /api
  API_URL: `${ORIGIN}/api`,
  // ✅ Socket apuntando al mismo host/puerto (si tu server usa socket.io por defecto no hace falta path)
  SOCKET_URL: toWS(ORIGIN),
  // Coordenadas por defecto
  DEFAULT_LAT: -34.6037,
  DEFAULT_LNG: -58.3816,
  APP_VERSION: '1.1.0',
};