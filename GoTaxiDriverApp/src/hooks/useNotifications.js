import * as Notifications from 'expo-notifications';

export function useNotifications() {
  const send = (title, body) => {
    Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };
  return { send };
}
