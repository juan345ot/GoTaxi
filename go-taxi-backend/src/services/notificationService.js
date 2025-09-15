const { logToFile } = require('../utils/logger');

/*
 * Servicio de notificaciones (placeholder).
 *
 * Por ahora se devuelven respuestas estáticas. Cada método registra la
 * llamada mediante logToFile para facilitar la trazabilidad de uso. Al
 * integrarse con servicios reales (FCM, OneSignal, Twilio, etc.) se
 * debería reemplazar la lógica y manejar errores con status y code.
 */

exports.sendPush = async (userId, title, message) => {
  // Registrar que se ha invocado la notificación push
  logToFile(`sendPush invocado (userId=${userId}, title=${title})`);
  // Devuelve estructura estándar hasta que se implemente la integración real
  return { success: false, message: 'Push notifications not implemented yet' };
};

exports.sendWhatsApp = async (telefono, mensaje) => {
  logToFile(`sendWhatsApp invocado (telefono=${telefono})`);
  return { success: false, message: 'WhatsApp notifications not implemented yet' };
};
