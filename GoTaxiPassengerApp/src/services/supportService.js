/**
 * Simula el envío de un reclamo al soporte
 */
export const sendSupportMessage = async (subject, message) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (subject && message) {
        resolve({ status: 'ok', date: new Date().toISOString() });
      } else {
        reject('Faltan campos requeridos');
      }
    }, 600);
  });
};