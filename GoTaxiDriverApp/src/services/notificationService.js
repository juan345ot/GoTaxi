import * as Notifications from 'expo-notifications';

export const sendPushNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
};
