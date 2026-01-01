import { ref, push, set, get, update, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Create a notification when employee turns off location
 */
export const createLocationOffNotification = async (employeeData) => {
  try {
    const notificationsRef = ref(database, 'notifications');
    const newNotificationRef = push(notificationsRef);
    
    const notification = {
      type: 'location_off',
      employeeName: employeeData.name,
      employeeCode: employeeData.code,
      employeeMobile: employeeData.mobile,
      message: `${employeeData.name} (${employeeData.code}) turned off location sharing`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    await set(newNotificationRef, notification);
    
    return { success: true, message: 'Notification created' };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, message: 'Failed to create notification' };
  }
};

/**
 * Get all notifications for admin (optimized - reduced default limit)
 */
export const getNotifications = async (limit = 20) => {
  try {
    const notificationsRef = ref(database, 'notifications');
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(notificationsQuery);
    
    if (!snapshot.exists()) {
      return { success: true, notifications: [] };
    }
    
    const notificationsData = snapshot.val();
    const notifications = Object.keys(notificationsData).map(key => ({
      id: key,
      ...notificationsData[key],
    }));
    
    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, notifications: [] };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = ref(database, `notifications/${notificationId}`);
    await update(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async () => {
  try {
    const result = await getNotifications();
    if (result.success) {
      const unreadCount = result.notifications.filter(n => !n.read).length;
      return { success: true, count: unreadCount };
    }
    return { success: false, count: 0 };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, count: 0 };
  }
};
