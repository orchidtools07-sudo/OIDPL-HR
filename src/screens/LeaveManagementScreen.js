import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { 
  getAllEmployees, 
  getAllLeaveRequests, 
  updateLeaveStatus,
  getEmployeeLeaveBalance,
  updateLeaveBalance
} from '../utils/auth';

const LeaveManagementScreen = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('casualSick');
  const [leaveAmount, setLeaveAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchLeaveRequests(), fetchEmployeeBalances()]);
    setLoading(false);
  };

  const fetchLeaveRequests = async () => {
    const result = await getAllLeaveRequests();
    if (result.success) {
      setLeaveRequests(result.leaves);
    }
  };

  const fetchEmployeeBalances = async () => {
    const employeesResult = await getAllEmployees();
    if (employeesResult.success) {
      const balances = await Promise.all(
        employeesResult.employees.map(async (emp) => {
          const balanceResult = await getEmployeeLeaveBalance(emp.id);
          return {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeCode: emp.code,
            ...(balanceResult.success ? balanceResult.balance : {
              casualSick: { total: 12, used: 0, balance: 12 },
              earnedLeave: { total: 18, used: 0, balance: 18 },
              compensatoryOff: { total: 0, used: 0, balance: 0 },
            }),
          };
        })
      );
      setEmployeeLeaves(balances);
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'balances') return false;
    return req.status.toLowerCase() === selectedTab;
  });

  const handleApprove = async (request) => {
    Alert.alert(
      'Approve Leave',
      `Approve leave for ${request.employeeName}?\n\nType: ${request.leaveType}\nDays: ${request.days}\nDates: ${request.fromDate.toLocaleDateString()} - ${request.toDate.toLocaleDateString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            const result = await updateLeaveStatus(request.id, 'Approved');
            if (result.success) {
              // Deduct from employee balance
              await updateEmployeeBalance(request.employeeId, request.leaveType, request.days, 'deduct');
              await loadData();
              Alert.alert('Success', 'Leave approved successfully');
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (request) => {
    Alert.alert(
      'Reject Leave',
      `Reject leave for ${request.employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const result = await updateLeaveStatus(request.id, 'Rejected');
            if (result.success) {
              await loadData();
              Alert.alert('Success', 'Leave rejected');
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const updateEmployeeBalance = async (employeeId, leaveType, days, action) => {
    const employee = employeeLeaves.find(emp => emp.employeeId === employeeId);
    if (!employee) return;

    const leaveKey = leaveType === 'Casual + Sick' ? 'casualSick' : 
                     leaveType === 'Earned Leave' ? 'earnedLeave' : 'compensatoryOff';
    
    const currentBalance = employee[leaveKey];
    const newUsed = action === 'deduct' ? currentBalance.used + days : currentBalance.used - days;
    const newBalance = currentBalance.total - newUsed;

    await updateLeaveBalance(employeeId, leaveKey, {
      ...currentBalance,
      used: newUsed,
      balance: newBalance,
    });
  };

  const handleUpdateLeave = async () => {
    if (!leaveAmount || isNaN(leaveAmount)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const amount = parseFloat(leaveAmount);
    const employee = employeeLeaves.find(emp => emp.employeeId === selectedEmployee.employeeId);
    if (!employee) return;

    const leaveTypeKey = selectedLeaveType;
    const currentData = employee[leaveTypeKey];
    
    const result = await updateLeaveBalance(selectedEmployee.employeeId, leaveTypeKey, {
      total: leaveTypeKey === 'compensatoryOff' ? amount : currentData.total,
      balance: amount,
      used: currentData.total - amount,
    });

    if (result.success) {
      Alert.alert('Success', `Leave balance updated for ${selectedEmployee.employeeName}`);
      setShowUpdateModal(false);
      setLeaveAmount('');
      await fetchEmployeeBalances();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderLeaveRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.employeeCode}>{item.employeeCode}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Approved' && styles.statusApproved,
          item.status === 'Rejected' && styles.statusRejected,
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.leaveDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {item.fromDate.toLocaleDateString()} - {item.toDate.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.days} days</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="bookmark-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.leaveType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="chatbox-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.reason}</Text>
        </View>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item)}
          >
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item)}
          >
            <Ionicons name="close" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmployeeLeave = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => {
        setSelectedEmployee(item);
        setShowUpdateModal(true);
      }}
    >
      <View style={styles.employeeHeader}>
        <View>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.employeeCode}>{item.employeeCode}</Text>
        </View>
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.leaveBalances}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Casual + Sick</Text>
          <Text style={styles.balanceValue}>{item.casualSick.balance}/{item.casualSick.total}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Earned Leave</Text>
          <Text style={styles.balanceValue}>{item.earnedLeave.balance}/{item.earnedLeave.total}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Comp Off</Text>
          <Text style={styles.balanceValue}>{item.compensatoryOff.balance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <Ionicons name="calendar" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>Leave Management</Text>
        <Text style={styles.headerSubtitle}>Manage employee leaves & requests</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leave data...</Text>
        </View>
      ) : (
        <>
          {/* Main Tabs */}
          <View style={styles.mainTabs}>
            <TouchableOpacity
              style={[styles.mainTab, selectedTab !== 'balances' && styles.mainTabActive]}
              onPress={() => setSelectedTab('pending')}
            >
              <Text style={[styles.mainTabText, selectedTab !== 'balances' && styles.mainTabTextActive]}>
                Leave Requests
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, selectedTab === 'balances' && styles.mainTabActive]}
              onPress={() => setSelectedTab('balances')}
            >
              <Text style={[styles.mainTabText, selectedTab === 'balances' && styles.mainTabTextActive]}>
                Employee Balances
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab !== 'balances' ? (
            <>
              {/* Status Tabs */}
              <View style={styles.tabsContainer}>
                {['pending', 'approved', 'rejected', 'all'].map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, selectedTab === tab && styles.activeTab]}
                    onPress={() => setSelectedTab(tab)}
                  >
                    <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Leave Requests List */}
              <FlatList
                data={filteredRequests}
                renderItem={renderLeaveRequest}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No leave requests found</Text>
                  </View>
                }
              />
            </>
          ) : (
            <>
              {/* Employee Leave Balances */}
              <FlatList
                data={employeeLeaves}
                renderItem={renderEmployeeLeave}
                keyExtractor={item => item.employeeId.toString()}
                contentContainerStyle={styles.listContainer}
              />
            </>
          )}
        </>
      )}

      {/* Update Leave Modal */}
      <Modal visible={showUpdateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Leave Balance</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedEmployee && (
              <>
                <Text style={styles.modalEmployeeName}>{selectedEmployee.employeeName}</Text>
                <Text style={styles.modalEmployeeCode}>{selectedEmployee.employeeCode}</Text>

                <View style={styles.leaveTypeSelector}>
                  <Text style={styles.inputLabel}>Leave Type</Text>
                  {[
                    { key: 'casualSick', label: 'Casual + Sick' },
                    { key: 'earnedLeave', label: 'Earned Leave' },
                    { key: 'compensatoryOff', label: 'Compensatory Off' }
                  ].map(type => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.leaveTypeButton,
                        selectedLeaveType === type.key && styles.leaveTypeButtonActive,
                      ]}
                      onPress={() => setSelectedLeaveType(type.key)}
                    >
                      <Text
                        style={[
                          styles.leaveTypeButtonText,
                          selectedLeaveType === type.key && styles.leaveTypeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Balance</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter leave balance"
                    keyboardType="numeric"
                    value={leaveAmount}
                    onChangeText={setLeaveAmount}
                  />
                </View>

                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateLeave}>
                  <Text style={styles.updateButtonText}>Update Balance</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl + 30,
    paddingBottom: SPACING.xl + 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.md,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.white,
    opacity: 0.95,
    marginTop: SPACING.xs,
  },
  mainTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: SPACING.sm,
  },
  mainTab: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mainTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  mainTabTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md + 4,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  employeeName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  employeeCode: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#f59e0b',
    minWidth: 90,
    alignItems: 'center',
  },
  statusApproved: {
    backgroundColor: '#10b981',
  },
  statusRejected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  leaveDetails: {
    gap: SPACING.sm + 4,
    marginBottom: SPACING.md,
    backgroundColor: '#f9fafb',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 4,
  },
  detailText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  employeeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  leaveBalances: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: SPACING.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalEmployeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalEmployeeCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: SPACING.lg,
  },
  leaveTypeSelector: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  leaveTypeButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: SPACING.sm,
  },
  leaveTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  leaveTypeButtonText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  leaveTypeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default LeaveManagementScreen;
