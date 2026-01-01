import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getAllEmployees } from '../utils/auth';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import EmployeeCard from '../components/EmployeeCard';
import { generateMultiEmployeeLocationReport } from '../utils/reportGenerator';

const EmployeeTrackingScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    fetchEmployees();
    
    // Set up real-time listener for employee locations
    const employeesRef = ref(database, 'employees');
    const unsubscribe = onValue(employeesRef, (snapshot) => {
      if (snapshot.exists()) {
        const employeesData = snapshot.val();
        const employeesList = Object.keys(employeesData).map(key => ({
          id: key,
          ...employeesData[key],
        }));
        
        console.log('🔵 Admin: Fetched employees from Firebase:', employeesList.length);
        employeesList.forEach(emp => {
          console.log(`📍 ${emp.name} (${emp.code}): ${emp.location?.address || emp.location || 'No location'}`);
        });
        
        setEmployees(employeesList);
        setLastUpdated(new Date());
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Fetch fresh data from Firebase
      const result = await getAllEmployees();
      if (result.success) {
        setEmployees(result.employees);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Update timestamp to show manual refresh
    setLastUpdated(new Date());
    // Real-time listener will automatically fetch latest data
    // Just trigger a manual fetch to ensure immediate update
    fetchEmployees();
  };

  const handleViewMap = (employee) => {
    navigation.navigate('EmployeeMap', { employee });
  };

  const handleViewDetails = (employee) => {
    navigation.navigate('EmployeeDetail', { employeeId: employee.id });
  };

  const toggleMultiSelect = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedEmployees([]);
  };

  const toggleEmployeeSelection = (employee) => {
    if (selectedEmployees.some(emp => emp.id === employee.id)) {
      setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employee.id));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees([...filteredEmployees]);
    }
  };

  const handleGenerateMultiReport = async () => {
    if (selectedEmployees.length === 0) {
      Alert.alert('Error', 'Please select at least one employee');
      return;
    }

    if (fromDate > toDate) {
      Alert.alert('Error', 'From date cannot be after To date');
      return;
    }

    try {
      setGeneratingReport(true);
      const result = await generateMultiEmployeeLocationReport(selectedEmployees, fromDate, toDate);
      
      if (result.success) {
        Alert.alert('Success', `Report generated for ${selectedEmployees.length} employee(s) from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`);
        setMultiSelectMode(false);
        setSelectedEmployees([]);
      } else {
        Alert.alert('Error', result.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>All Employees</Text>
              <Text style={styles.headerSubtitle}>{filteredEmployees.length} of {employees.length} employees</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.actionButton, multiSelectMode && styles.actionButtonActive]}
                onPress={toggleMultiSelect}
              >
                <Ionicons name={multiSelectMode ? "close" : "checkbox-outline"} size={24} color={multiSelectMode ? COLORS.white : COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.updateTime}>Last updated: {lastUpdated.toLocaleString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.darkGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, code, or location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.darkGray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Multi-select toolbar */}
          {multiSelectMode && (
            <View style={styles.multiSelectToolbar}>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={selectAllEmployees}
              >
                <Ionicons 
                  name={selectedEmployees.length === filteredEmployees.length ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.selectAllText}>
                  {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.selectedCount}>{selectedEmployees.length} selected</Text>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading employees...</Text>
            </View>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => (
              <TouchableOpacity
                key={employee.id}
                onPress={() => multiSelectMode ? toggleEmployeeSelection(employee) : null}
                activeOpacity={multiSelectMode ? 0.7 : 1}
              >
                <View style={styles.employeeCardWrapper}>
                  {multiSelectMode && (
                    <View style={styles.checkboxContainer}>
                      <Ionicons 
                        name={selectedEmployees.some(emp => emp.id === employee.id) ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={COLORS.primary} 
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <EmployeeCard
                      employee={employee}
                      onViewMap={handleViewMap}
                      onViewDetails={handleViewDetails}
                      disableActions={multiSelectMode}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No employees found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          )}
        </ScrollView>

        {/* Floating action button for multi-select */}
        {multiSelectMode && selectedEmployees.length > 0 && (
          <View style={styles.fabContainer}>
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="download" size={24} color={COLORS.white} />
              <Text style={styles.fabText}>Download Report ({selectedEmployees.length})</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Range Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerSection}>
                <Text style={styles.dateLabel}>From Date:</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.dateButtonText}>{fromDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <Text style={[styles.dateLabel, { marginTop: SPACING.md }]}>To Date:</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.dateButtonText}>{toDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.downloadButton]}
                  onPress={handleGenerateMultiReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={20} color={COLORS.white} />
                      <Text style={styles.downloadButtonText}>Generate Report</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* From Date Picker */}
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowFromDatePicker(false);
              if (selectedDate) {
                setFromDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* To Date Picker */}
        {showToDatePicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowToDatePicker(false);
              if (selectedDate) {
                setToDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
            minimumDate={fromDate}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...SHADOWS.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.small,
  },
  actionButtonActive: {
    backgroundColor: COLORS.primary,
  },
  multiSelectToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    marginTop: SPACING.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  selectAllText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  employeeCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkboxContainer: {
    padding: SPACING.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
  },
  fab: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  fabText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  datePickerSection: {
    paddingVertical: SPACING.md,
  },
  dateLabel: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
  },
  dateButtonText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
  },
  refreshButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.small,
  },
  updateTime: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.large,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
  },
});

export default EmployeeTrackingScreen;
