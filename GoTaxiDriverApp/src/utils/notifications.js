// Acá podrás centralizar lógica de push notifications
export const sendLocalNotification = (title, body) => {
  // Integrar con expo-notifications o push real más adelante
  // Por ahora, simulá un alert o toast
  alert(`${title}\n${body}`);
};
