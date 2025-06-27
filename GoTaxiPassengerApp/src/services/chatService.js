/**
 * Simula el envío de un mensaje de chat
 */
export const sendMessage = async (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        text,
        time: new Date().toISOString(),
        isOwn: true,
      });
    }, 300);
  });
};