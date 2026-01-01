import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getNotifications, approveLeaveRequest, rejectLeaveRequest, markNotificationAsRead } from '../utils/auth';
import { showLeaveRequestNotification, showLeaveApprovedNotification, showLeaveRejectedNotification } from '../utils/pushNotifications';

const NotificationsScreen = ({ route }) => {
  const { userData } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [processingNotificationId, setProcessingNotificationId] = useState(null);

  useEffect(() => {
    console.log('NotificationsScreen - userData:', userData);
    if (userData && userData.id) {
      console.log('Loading notifications for user:', userData.id);
      loadNotifications();
      
      // Set up real-time listener for new notifications
      setupNotificationListener();
    } else {
      console.warn('No userData or userData.id found in NotificationsScreen');
      setLoading(false);
    }
  }, [userData]);

  const setupNotificationListener = () => {
    const notificationsRef = ref(database, 'notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsList = Object.keys(notificationsData)
          .map(key => ({
            id: key,
            ...notificationsData[key],
          }))
          .filter(notif => {
            // Filter for current user
            const isRecipient = notif.recipientId === userData.id || notif.recipientId === 'admin';
            
            // Don't show leave_request if user is the employee
            if (notif.type === 'leave_request' && notif.employeeId === userData.id) {
              return false;
            }
            
            return isRecipient;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Check for new notifications and trigger push notification
        notificationsList.forEach(notif => {
          if (!notif.read && notif.createdAt) {
            const notifTime = new Date(notif.createdAt).getTime();
            const now = Date.now();
            
            // If notification is less than 5 seconds old, it's new
            if (now - notifTime < 5000) {
              console.log('🔔 New notification detected:', notif.type);
              
              // Show push notification based on type
              if (notif.type === 'leave_request') {
                showLeaveRequestNotification(notif);
              } else if (notif.type === 'leave_approved') {
                showLeaveApprovedNotification(notif);
              } else if (notif.type === 'leave_rejected') {
                showLeaveRejectedNotification(notif);
              }
            }
          }
        });

        setNotifications(notificationsList);
      }
    });

    return unsubscribe;
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching notifications for userId:', userData?.id);
      const notifs = await getNotifications(userData?.id);
      console.log('Received notifications:', notifs.length);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleApprove = async (notification) => {
    Alert.alert(
      'Approve Leave',
      `Approve leave request from ${notification.employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessingNotificationId(notification.id);
            const result = await approveLeaveRequest(
              notification.leaveId,
              notification.id,
              userData?.name || 'Manager',
              'Manager'
            );
            setProcessingNotificationId(null);
            
            if (result.success) {
              Alert.alert('Success', 'Leave request approved');
              loadNotifications();
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (notification) => {
    Alert.prompt(
      'Reject Leave',
      `Reject leave request from ${notification.employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason) => {
            setProcessingNotificationId(notification.id);
            const result = await rejectLeaveRequest(
              notification.leaveId,
              notification.id,
              userData?.name || 'Manager',
              'Manager',
              reason || 'No reason provided'
            );
            setProcessingNotificationId(null);
            
            if (result.success) {
              Alert.alert('Success', 'Leave request rejected');
              loadNotifications();
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getIconColor = (type, read) => {
    if (read) return COLORS.darkGray;
    switch (type) {
      case 'leave_request': return COLORS.primary;
      case 'leave_approved': return '#4CAF50';
      case 'leave_rejected': return '#f44336';
      case 'announcement': return COLORS.primary;
      case 'policy': return COLORS.secondary;
      case 'reminder': return '#FF9800';
      default: return COLORS.primary;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_request': return 'calendar';
      case 'leave_approved': return 'checkmark-circle';
      case 'leave_rejected': return 'close-circle';
      default: return 'notifications';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Notifications</Text>
        <Text style={styles.headerSubtitle}>
          {notifications.filter(n => !n.read).length} unread
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No Notifications</Text>
          <Text style={styles.emptySubtext}>You're all caught up!</Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <View
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
          >
            <View style={[
              styles.notificationIcon,
              { backgroundColor: notification.read ? COLORS.gray : getIconColor(notification.type, false) + '20' }
            ]}>
              <Ionicons 
                name={getNotificationIcon(notification.type)} 
                size={24} 
                color={getIconColor(notification.type, notification.read)}
              />
            </View>
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                  {notification.title || 
                   (notification.type === 'leave_request' 
                    ? `Leave Request from ${notification.employeeName}`
                    : notification.type === 'leave_approved'
                    ? 'Leave Approved ✓'
                    : notification.type === 'leave_rejected'
                    ? 'Leave Rejected ✗'
                    : 'Notification')}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.createdAt)}
                </Text>
              </View>
              
              {notification.type === 'leave_request' && (
                <>
                  <Text style={styles.notificationMessage}>
                    {notification.employeeName} ({notification.employeeCode}) has requested leave
                  </Text>
                  <View style={styles.leaveDetails}>
                    <View style={styles.leaveDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.text} />
                      <Text style={styles.leaveDetailText}>
                        {new Date(notification.fromDate).toLocaleDateString()} - {new Date(notification.toDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.leaveDetailRow}>
                      <Ionicons name="time-outline" size={16} color={COLORS.text} />
                      <Text style={styles.leaveDetailText}>{notification.days} days</Text>
                    </View>
                    <View style={styles.leaveDetailRow}>
                      <Ionicons name="list-outline" size={16} color={COLORS.text} />
                      <Text style={styles.leaveDetailText}>{notification.leaveType}</Text>
                    </View>
                    <Text style={styles.leaveReason}>Reason: {notification.reason}</Text>
                  </View>
                  
                  {notification.status === 'Pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton, processingNotificationId === notification.id && styles.buttonDisabled]}
                        onPress={() => handleReject(notification)}
                        disabled={processingNotificationId === notification.id}
                      >
                        {processingNotificationId === notification.id ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <>
                            <Ionicons name="close-circle" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Reject</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton, processingNotificationId === notification.id && styles.buttonDisabled]}
                        onPress={() => handleApprove(notification)}
                        disabled={processingNotificationId === notification.id}
                      >
                        {processingNotificationId === notification.id ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Approve</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {notification.status !== 'Pending' && (
                    <View style={[styles.statusBadge, notification.status === 'Approved' ? styles.approvedBadge : styles.rejectedBadge]}>
                      <Text style={styles.statusBadgeText}>
                        {notification.status} by {notification.actionBy}
                      </Text>
                    </View>
                  )}
                </>
              )}
              
              {notification.type === 'leave_approved' && (
                <View>
                  <Text style={styles.notificationMessage}>
                    {notification.message || `Your leave request has been approved`}
                  </Text>
                  <View style={styles.leaveDetails}>
                    {notification.leaveType && (
                      <View style={styles.leaveDetailRow}>
                        <Ionicons name="list-outline" size={16} color={COLORS.text} />
                        <Text style={styles.leaveDetailText}>{notification.leaveType}</Text>
                      </View>
                    )}
                    {notification.fromDate && notification.toDate && (
                      <View style={styles.leaveDetailRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.text} />
                        <Text style={styles.leaveDetailText}>
                          {new Date(notification.fromDate).toLocaleDateString()} - {new Date(notification.toDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {notification.approvedBy && (
                      <View style={[styles.statusBadge, styles.approvedBadge]}>
                        <Text style={styles.statusBadgeText}>
                          Approved by {notification.approvedBy}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {notification.type === 'leave_rejected' && (
                <View>
                  <Text style={styles.notificationMessage}>
                    {notification.message || `Your leave request was rejected`}
                  </Text>
                  <View style={styles.leaveDetails}>
                    {notification.leaveType && (
                      <View style={styles.leaveDetailRow}>
                        <Ionicons name="list-outline" size={16} color={COLORS.text} />
                        <Text style={styles.leaveDetailText}>{notification.leaveType}</Text>
                      </View>
                    )}
                    {notification.fromDate && notification.toDate && (
                      <View style={styles.leaveDetailRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.text} />
                        <Text style={styles.leaveDetailText}>
                          {new Date(notification.fromDate).toLocaleDateString()} - {new Date(notification.toDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {notification.rejectionReason && (
                      <Text style={styles.leaveReason}>Reason: {notification.rejectionReason}</Text>
                    )}
                    {notification.rejectedBy && (
                      <View style={[styles.statusBadge, styles.rejectedBadge]}>
                        <Text style={styles.statusBadgeText}>
                          Rejected by {notification.rejectedBy}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  headerTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.card,
  },
  unreadCard: {
    backgroundColor: '#F8FBFF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginLeft: SPACING.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  infoCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginLeft: SPACING.md,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
  },
  leaveDetails: {
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.small,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  leaveDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  leaveDetailText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  leaveReason: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
  },
  statusBadge: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    marginTop: SPACING.sm,
  },
  approvedBadge: {
    backgroundColor: '#E8F5E9',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgeText: {
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationsScreen;