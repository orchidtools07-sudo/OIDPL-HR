import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      // Channel for leave notifications
      await Notifications.setNotificationChannelAsync('leave-notifications', {
        name: 'Leave Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      // Channel for location updates
      await Notifications.setNotificationChannelAsync('location-updates', {
        name: 'Location Updates',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
      });
    }

    console.log('✅ Push notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return false;
  }
};

/**
 * Show local notification for leave request (for managers/admin)
 */
export const showLeaveRequestNotification = async (notification) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📋 New Leave Request`,
        body: `${notification.employeeName} (${notification.employeeCode}) has requested ${notification.leaveType} for ${notification.days} day(s)`,
        data: { 
          type: 'leave_request',
          notificationId: notification.id,
          leaveId: notification.leaveId,
          employeeId: notification.employeeId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null, // Show immediately
    });
    console.log('✅ Leave request notification shown');
  } catch (error) {
    console.error('Error showing leave request notification:', error);
  }
};

/**
 * Show local notification for leave approval (for employees)
 */
export const showLeaveApprovedNotification = async (notification) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ Leave Approved`,
        body: `Your ${notification.leaveType} request has been approved by ${notification.approvedBy}`,
        data: { 
          type: 'leave_approved',
          notificationId: notification.id,
          leaveId: notification.leaveId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null,
    });
    console.log('✅ Leave approved notification shown');
  } catch (error) {
    console.error('Error showing leave approved notification:', error);
  }
};

/**
 * Show local notification for leave rejection (for employees)
 */
export const showLeaveRejectedNotification = async (notification) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `❌ Leave Rejected`,
        body: `Your ${notification.leaveType} request has been rejected by ${notification.rejectedBy}`,
        data: { 
          type: 'leave_rejected',
          notificationId: notification.id,
          leaveId: notification.leaveId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null,
    });
    console.log('✅ Leave rejected notification shown');
  } catch (error) {
    console.error('Error showing leave rejected notification:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Get notification badge count
 */
export const getBadgeCount = async () => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

/**
 * Set notification badge count
 */
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
