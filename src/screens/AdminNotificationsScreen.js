import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getNotifications, approveLeaveRequest, rejectLeaveRequest, markNotificationAsRead } from '../utils/auth';

const AdminNotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingNotificationId, setProcessingNotificationId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getNotifications('admin');
    setNotifications(result);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleApprove = async (notification) => {
    Alert.alert(
      'Approve Leave',
      `Approve leave request from ${notification.employeeName}?\n\nManagers: ${notification.managers?.map(m => m.name).join(', ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessingNotificationId(notification.id);
            const result = await approveLeaveRequest(
              notification.leaveId,
              notification.id,
              'HR Department',
              'HR'
            );
            setProcessingNotificationId(null);
            
            if (result.success) {
              Alert.alert('Success', 'Leave request approved');
              fetchNotifications();
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
      `Reject leave request from ${notification.employeeName}?\n\nManagers: ${notification.managers?.map(m => m.name).join(', ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason) => {
            setProcessingNotificationId(notification.id);
            const result = await rejectLeaveRequest(
              notification.leaveId,
              notification.id,
              'HR Department',
              'HR',
              reason || 'No reason provided'
            );
            setProcessingNotificationId(null);
            
            if (result.success) {
              Alert.alert('Success', 'Leave request rejected');
              fetchNotifications();
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

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      fetchNotifications();
    }
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-off" size={80} color={COLORS.darkGray} />
        </View>
        <Text style={styles.title}>No Notifications</Text>
        <Text style={styles.subtitle}>No pending actions</Text>
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
        <Text style={styles.headerTitle}>HR Notifications</Text>
        <Text style={styles.headerSubtitle}>
          {notifications.filter(n => !n.read).length} unread • {notifications.length} total
        </Text>
      </View>

      {notifications.map((notification) => (
        <View
          key={notification.id}
          style={[styles.notificationCard, !notification.read && styles.unreadCard]}
        >
          <View style={[styles.notificationIcon, !notification.read && styles.unreadIcon]}>
            <Ionicons 
              name={notification.type === 'leave_request' ? 'calendar' : 'notifications'} 
              size={24} 
              color={!notification.read ? COLORS.primary : COLORS.darkGray}
            />
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                Leave Request from {notification.employeeName}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTime(notification.createdAt)}
              </Text>
            </View>
            
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
              {notification.managers && notification.managers.length > 0 && (
                <View style={styles.leaveDetailRow}>
                  <Ionicons name="people-outline" size={16} color={COLORS.text} />
                  <Text style={styles.leaveDetailText}>
                    Managers: {notification.managers.map(m => m.name).join(', ')}
                  </Text>
                </View>
              )}
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
          </View>
        </View>
      ))}
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
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
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
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
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
  unreadIcon: {
    backgroundColor: COLORS.error,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  employeeCode: {
    fontSize: FONTS.sizes.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
    backgroundColor: COLORS.error,
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
    flex: 1,
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

export default AdminNotificationsScreen;
