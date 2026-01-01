import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications, addNotificationReceivedListener, addNotificationResponseListener } from './src/utils/pushNotifications';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('📩 Notification received:', notification);
    });

    // Listen for user tapping on notification
    responseListener.current = addNotificationResponseListener(response => {
      console.log('👆 Notification tapped:', response);
      // You can navigate to specific screen based on notification data
      const data = response.notification.request.content.data;
      console.log('Notification data:', data);
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
