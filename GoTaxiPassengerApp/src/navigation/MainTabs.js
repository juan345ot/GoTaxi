import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Booking/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import SupportScreen from '../screens/Support/SupportScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from './routes';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon = 'ellipse';

          switch (route.name) {
            case ROUTES.HOME:
              icon = 'home';
              break;
            case ROUTES.PROFILE:
              icon = 'person';
              break;
            case ROUTES.HISTORY:
              icon = 'time';
              break;
            case ROUTES.SUPPORT:
              icon = 'help-circle';
              break;
            case ROUTES.CHAT:
              icon = 'chatbubble-ellipses';
              break;
          }

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
      <Tab.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <Tab.Screen name={ROUTES.SUPPORT} component={SupportScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
