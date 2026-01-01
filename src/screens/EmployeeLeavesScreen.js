import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getEmployeeLeaves, getEmployeeLeaveBalance } from '../utils/auth';

const EmployeeLeavesScreen = ({ navigation, route }) => {
  const { userData } = route?.params || {};
  const [loading, setLoading] = useState(true);
  
  // Leave balance from Firebase
  const [leaveBalance, setLeaveBalance] = useState({
    casualSick: { total: 12, used: 0, balance: 12 },
    earnedLeave: { total: 18, used: 0, balance: 18 },
    compensatoryOff: { total: 0, used: 0, balance: 0 },
  });

  // Leave applications from Firebase
  const [leaveApplications, setLeaveApplications] = useState([]);

  useEffect(() => {
    loadLeaveData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLeaveData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadLeaveData = async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await Promise.all([fetchLeaveBalance(), fetchLeaveApplications()]);
    setLoading(false);
  };

  const fetchLeaveBalance = async () => {
    const result = await getEmployeeLeaveBalance(userData.id);
    if (result.success) {
      setLeaveBalance(result.balance);
    }
  };

  const fetchLeaveApplications = async () => {
    const result = await getEmployeeLeaves(userData.id);
    if (result.success) {
      setLeaveApplications(result.leaves);
    }
  };

  const getTotalLeaves = () => {
    return leaveBalance.casualSick.total + leaveBalance.earnedLeave.total + leaveBalance.compensatoryOff.total;
  };

  const getTotalRemaining = () => {
    return leaveBalance.casualSick.balance + leaveBalance.earnedLeave.balance + leaveBalance.compensatoryOff.balance;
  };

  const getTotalUsed = () => {
    return leaveBalance.casualSick.used + leaveBalance.earnedLeave.used + leaveBalance.compensatoryOff.used;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      case 'Pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, '#004A8D']}
          style={styles.header}
        >
          <Ionicons name="calendar" size={48} color={COLORS.white} />
          <Text style={styles.headerTitle}>Leave Management</Text>
          <Text style={styles.headerSubtitle}>Apply and track your leaves</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leave data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <Ionicons name="calendar" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>Leave Management</Text>
        <Text style={styles.headerSubtitle}>Apply and track your leaves</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Leave Balance Cards */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#006dc0', '#0088ff']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceValue}>{getTotalLeaves()}</Text>
              <Text style={styles.balanceLabel}>Total Leaves</Text>
            </LinearGradient>
          </View>

          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#10b981', '#34d399']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceValue}>{getTotalRemaining()}</Text>
              <Text style={styles.balanceLabel}>Remaining</Text>
            </LinearGradient>
          </View>

          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#f59e0b', '#fbbf24']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceValue}>{getTotalUsed()}</Text>
              <Text style={styles.balanceLabel}>Used</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Detailed Balance */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Leave Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={[styles.detailBadge, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="briefcase" size={20} color="#006dc0" />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Earned Leave (EL)</Text>
                <View style={styles.detailValues}>
                  <Text style={styles.detailTotal}>{leaveBalance.earnedLeave.total} Total</Text>
                  <Text style={styles.detailUsed}>{leaveBalance.earnedLeave.used} Used</Text>
                  <Text style={styles.detailRemaining}>{leaveBalance.earnedLeave.balance} Left</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={[styles.detailBadge, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Casual + Sick Leave</Text>
                <View style={styles.detailValues}>
                  <Text style={styles.detailTotal}>{leaveBalance.casualSick.total} Total</Text>
                  <Text style={styles.detailUsed}>{leaveBalance.casualSick.used} Used</Text>
                  <Text style={styles.detailRemaining}>{leaveBalance.casualSick.balance} Left</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={[styles.detailBadge, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="gift-outline" size={20} color="#6366f1" />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Compensatory Off</Text>
                <View style={styles.detailValues}>
                  <Text style={styles.detailTotal}>{leaveBalance.compensatoryOff.total} Total</Text>
                  <Text style={styles.detailUsed}>{leaveBalance.compensatoryOff.used} Used</Text>
                  <Text style={styles.detailRemaining}>{leaveBalance.compensatoryOff.balance} Left</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Apply Leave Button */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('ApplyLeave', { 
            userData: userData 
          })}
        >
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.applyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.applyButtonText}>Apply for Leave</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Leave Applications */}
        <View style={styles.applicationsContainer}>
          <Text style={styles.sectionTitle}>Leave Applications</Text>

          {leaveApplications.length > 0 ? (
            leaveApplications.map((leave) => (
              <View key={leave.id} style={styles.leaveCard}>
                <View style={styles.leaveHeader}>
                  <View style={styles.leaveTypeContainer}>
                    <Ionicons
                      name={leave.leaveType === 'Earned Leave' ? 'briefcase' : 
                           leave.leaveType === 'Casual + Sick' ? 'calendar-outline' : 'gift-outline'}
                      size={20}
                      color={leave.leaveType === 'Earned Leave' ? '#006dc0' : 
                            leave.leaveType === 'Casual + Sick' ? '#f59e0b' : '#6366f1'}
                    />
                    <Text style={styles.leaveType}>{leave.leaveType}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(leave.status) }]}>
                    <Text style={styles.statusText}>{leave.status}</Text>
                  </View>
                </View>

                <View style={styles.leaveDetails}>
                  <View style={styles.leaveDetailRow}>
                    <Ionicons name="calendar" size={16} color={COLORS.text} />
                    <Text style={styles.leaveDetailText}>
                      {leave.fromDate.toLocaleDateString()} - {leave.toDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.leaveDetailRow}>
                    <Ionicons name="time" size={16} color={COLORS.text} />
                    <Text style={styles.leaveDetailText}>{leave.days} Day(s)</Text>
                  </View>
                  <View style={styles.leaveDetailRow}>
                    <Ionicons name="document-text" size={16} color={COLORS.text} />
                    <Text style={styles.leaveDetailText}>{leave.reason}</Text>
                  </View>
                  <View style={styles.leaveDetailRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.text} />
                    <Text style={styles.leaveDetailText}>
                      Applied on {leave.appliedDate.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No leave applications yet</Text>
              <Text style={styles.emptySubtext}>Apply for your first leave using the button above</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployeeLeavesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl + 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  balanceGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  balanceLabel: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  detailValues: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  detailTotal: {
    fontSize: 13,
    color: '#666',
  },
  detailUsed: {
    fontSize: 13,
    color: '#ef4444',
  },
  detailRemaining: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  applyButton: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  applicationsContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  leaveCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  leaveDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: SPACING.sm,
  },
  leaveDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  leaveDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
