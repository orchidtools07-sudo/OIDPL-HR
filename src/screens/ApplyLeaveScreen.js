import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { applyLeave, getAllEmployees } from '../utils/auth';

const ApplyLeaveScreen = ({ navigation, route }) => {
  const { userData } = route.params || {};

  // Form states
  const [leaveType, setLeaveType] = useState('Earned Leave');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manager selection states
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const result = await getAllEmployees();
      setEmployees(result?.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
      Alert.alert('Error', 'Failed to load employee list. Please check your connection.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Filter managers based on search query
  const filteredManagers = Array.isArray(employees) 
    ? employees.filter((emp) =>
        emp.name?.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
        emp.code?.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(managerSearchQuery.toLowerCase())
      )
    : [];

  const calculateDays = () => {
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const toggleManagerSelection = (manager) => {
    setSelectedManagers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((m) => m.id === manager.id);
      if (isAlreadySelected) {
        return prevSelected.filter((m) => m.id !== manager.id);
      } else {
        return [...prevSelected, manager];
      }
    });
    // Close dropdown after selection
    setShowManagerDropdown(false);
  };

  const removeManager = (managerId) => {
    setSelectedManagers((prevSelected) =>
      prevSelected.filter((m) => m.id !== managerId)
    );
  };

  const isManagerSelected = (managerId) => {
    return selectedManagers.some((m) => m.id === managerId);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter reason for leave');
      return;
    }

    if (fromDate > toDate) {
      Alert.alert('Error', 'From date cannot be after To date');
      return;
    }

    if (selectedManagers.length === 0) {
      Alert.alert('Error', 'Please select at least one manager');
      return;
    }

    // Check if employee selected themselves as manager
    const selectedSelf = selectedManagers.some(m => m.id === userData.id);
    if (selectedSelf) {
      Alert.alert('Error', 'You cannot select yourself as a manager for your own leave request');
      return;
    }

    if (!userData || !userData.id) {
      Alert.alert('Error', 'User data not available. Please login again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const leaveData = {
        leaveType,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        days: calculateDays(),
        reason: reason.trim(),
        managers: selectedManagers.map(m => ({
          id: m.id,
          name: m.name,
          code: m.code,
        })),
        employeeName: userData.name,
        employeeCode: userData.code,
      };

      await applyLeave(userData.id, leaveData);

      Alert.alert(
        'Success',
        `Leave application submitted successfully to ${selectedManagers.length} manager(s)`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert('Error', 'Failed to submit leave application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <Ionicons name="document-text" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>Apply for Leave</Text>
        <Text style={styles.headerSubtitle}>Fill in the details below</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Leave Type */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Leave Type *</Text>
          <View style={styles.leaveTypeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                leaveType === 'Earned Leave' && styles.typeButtonActive
              ]}
              onPress={() => setLeaveType('Earned Leave')}
            >
              <Ionicons 
                name="briefcase" 
                size={20} 
                color={leaveType === 'Earned Leave' ? COLORS.white : COLORS.text} 
              />
              <Text style={[
                styles.typeButtonText,
                leaveType === 'Earned Leave' && styles.typeButtonTextActive
              ]}>
                Earned Leave
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                leaveType === 'Casual Leave' && styles.typeButtonActive
              ]}
              onPress={() => setLeaveType('Casual Leave')}
            >
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={leaveType === 'Casual Leave' ? COLORS.white : COLORS.text} 
              />
              <Text style={[
                styles.typeButtonText,
                leaveType === 'Casual Leave' && styles.typeButtonTextActive
              ]}>
                Casual Leave
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>From Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
            <Text style={styles.dateText}>{fromDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showFromDatePicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowFromDatePicker(false);
                if (selectedDate) setFromDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>To Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowToDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
            <Text style={styles.dateText}>{toDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showToDatePicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowToDatePicker(false);
                if (selectedDate) setToDate(selectedDate);
              }}
              minimumDate={fromDate}
            />
          )}
        </View>

        {/* Total Days */}
        <View style={styles.totalDaysContainer}>
          <Ionicons name="time" size={24} color={COLORS.primary} />
          <Text style={styles.totalDaysLabel}>Total Days:</Text>
          <Text style={styles.totalDaysValue}>{calculateDays()} Day(s)</Text>
        </View>

        {/* Select Managers */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Select Manager(s) *</Text>
          
          {/* Selected Managers Pills */}
          {selectedManagers.length > 0 && (
            <View style={styles.selectedManagersContainer}>
              {selectedManagers.map((manager) => (
                <View key={manager.id} style={styles.managerPill}>
                  <Text style={styles.managerPillText}>
                    {manager.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeManager(manager.id)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Manager Search Input */}
          <TouchableOpacity
            style={styles.managerSearchInput}
            onPress={() => setShowManagerDropdown(!showManagerDropdown)}
            activeOpacity={1}
          >
            <Ionicons name="search" size={20} color={COLORS.text} />
            <TextInput
              style={styles.managerSearchText}
              placeholder="Search and select managers..."
              value={managerSearchQuery}
              onChangeText={(text) => {
                setManagerSearchQuery(text);
                setShowManagerDropdown(true);
              }}
              onFocus={() => setShowManagerDropdown(true)}
            />
            <TouchableOpacity onPress={() => setShowManagerDropdown(!showManagerDropdown)}>
              <Ionicons
                name={showManagerDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Manager Dropdown List */}
          {showManagerDropdown && (
            <View style={styles.managerDropdown}>
              {loadingEmployees ? (
                <View style={styles.managerLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.managerLoadingText}>Loading employees...</Text>
                </View>
              ) : filteredManagers.length > 0 ? (
                <FlatList
                  data={filteredManagers}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.managerList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.managerItem,
                        isManagerSelected(item.id) && styles.managerItemSelected,
                      ]}
                      onPress={() => toggleManagerSelection(item)}
                    >
                      <View style={styles.managerItemLeft}>
                        <View style={[
                          styles.managerAvatar,
                          isManagerSelected(item.id) && styles.managerAvatarSelected,
                        ]}>
                          <Text style={[
                            styles.managerAvatarText,
                            isManagerSelected(item.id) && styles.managerAvatarTextSelected,
                          ]}>
                            {item.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.managerInfo}>
                          <Text style={styles.managerName}>{item.name}</Text>
                          <Text style={styles.managerDesignation}>
                            {item.designation} • {item.code}
                          </Text>
                        </View>
                      </View>
                      {isManagerSelected(item.id) && (
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={48} color="#ccc" />
                  <Text style={styles.noResultsText}>No managers found</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Reason *</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Enter reason for leave..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={isSubmitting ? ['#cccccc', '#999999'] : [COLORS.primary, '#004A8D']}
              style={styles.submitButtonGradient}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Submit Leave</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ApplyLeaveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl + 10,
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
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.card,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  leaveTypeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: SPACING.xs,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  totalDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.card,
    gap: SPACING.sm,
  },
  totalDaysLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  totalDaysValue: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedManagersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  managerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  managerPillText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  managerSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: SPACING.sm,
  },
  managerSearchText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  managerDropdown: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: SPACING.sm,
    maxHeight: 250,
    ...SHADOWS.card,
  },
  managerList: {
    maxHeight: 250,
  },
  managerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  managerItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  managerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  managerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  managerAvatarSelected: {
    backgroundColor: COLORS.primary,
  },
  managerAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  managerAvatarTextSelected: {
    color: COLORS.white,
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  managerDesignation: {
    fontSize: 12,
    color: '#666',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    marginTop: SPACING.sm,
  },
  reasonInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...SHADOWS.card,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  managerLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  managerLoadingText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
