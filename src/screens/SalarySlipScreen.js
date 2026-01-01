import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { EMPLOYEES } from '../data/mockData';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SalarySlipScreen = () => {
  // State for salary slips (demo data)
  const [salarySlips, setSalarySlips] = useState([
    {
      id: 1,
      employeeCode: 'EMP001',
      employeeName: 'Vikrant Singh',
      month: 'December',
      year: 2025,
      uploadDate: new Date('2025-12-10'),
      fileName: 'salary_slip_dec_2025_emp001.pdf',
      status: 'Sent',
    },
    {
      id: 2,
      employeeCode: 'EMP002',
      employeeName: 'Priya Sharma',
      month: 'December',
      year: 2025,
      uploadDate: new Date('2025-12-10'),
      fileName: 'salary_slip_dec_2025_emp002.pdf',
      status: 'Sent',
    },
    {
      id: 3,
      employeeCode: 'EMP003',
      employeeName: 'Rahul Verma',
      month: 'December',
      year: 2025,
      uploadDate: new Date('2025-12-12'),
      fileName: 'salary_slip_dec_2025_emp003.pdf',
      status: 'Sent',
    },
    {
      id: 4,
      employeeCode: 'EMP004',
      employeeName: 'Anjali Patel',
      month: 'December',
      year: 2025,
      uploadDate: new Date('2025-12-12'),
      fileName: 'salary_slip_dec_2025_emp004.pdf',
      status: 'Sent',
    },
    {
      id: 5,
      employeeCode: 'EMP005',
      employeeName: 'Rohit Mehra',
      month: 'December',
      year: 2025,
      uploadDate: new Date('2025-12-15'),
      fileName: 'salary_slip_dec_2025_emp005.pdf',
      status: 'Sent',
    },
    {
      id: 6,
      employeeCode: 'EMP001',
      employeeName: 'Vikrant Singh',
      month: 'November',
      year: 2025,
      uploadDate: new Date('2025-11-05'),
      fileName: 'salary_slip_nov_2025_emp001.pdf',
      status: 'Sent',
    },
    {
      id: 7,
      employeeCode: 'EMP002',
      employeeName: 'Priya Sharma',
      month: 'November',
      year: 2025,
      uploadDate: new Date('2025-11-05'),
      fileName: 'salary_slip_nov_2025_emp002.pdf',
      status: 'Sent',
    },
  ]);

  // Modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFile, setSelectedFile] = useState(null);
  const [employeeDropdownVisible, setEmployeeDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  // Handle file upload
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || result.assets) {
        const file = result.assets ? result.assets[0] : result;
        setSelectedFile({
          name: file.name,
          uri: file.uri,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // Handle upload salary slip
  const handleUploadSlip = () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }

    // Create new slip
    const newSlip = {
      id: Date.now(),
      employeeCode: selectedEmployee.code,
      employeeName: selectedEmployee.name,
      month: selectedMonth,
      year: selectedYear,
      uploadDate: new Date(),
      fileName: selectedFile.name,
      status: 'Sent',
    };

    setSalarySlips([newSlip, ...salarySlips]);
    
    // Reset form
    setSelectedEmployee(null);
    setSelectedFile(null);
    setUploadModalVisible(false);
    
    Alert.alert('Success', `Salary slip uploaded for ${selectedEmployee.name}`);
  };

  // Handle delete slip
  const handleDeleteSlip = (slipId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this salary slip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSalarySlips(salarySlips.filter(slip => slip.id !== slipId));
            Alert.alert('Success', 'Salary slip deleted');
          },
        },
      ]
    );
  };

  // Handle view slip (simulated)
  const handleViewSlip = (slip) => {
    Alert.alert(
      'View Salary Slip',
      `Employee: ${slip.employeeName}\nMonth: ${slip.month} ${slip.year}\nFile: ${slip.fileName}`,
      [{ text: 'OK' }]
    );
  };

  // Filter slips
  const filteredSlips = salarySlips.filter(slip => {
    const matchesSearch = slip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         slip.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = filterMonth === 'All' || slip.month === filterMonth;
    return matchesSearch && matchesMonth;
  });

  // Calculate statistics
  const totalSlips = salarySlips.length;
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentMonthSlips = salarySlips.filter(slip => 
    slip.month === currentMonth && slip.year === new Date().getFullYear()
  ).length;
  const uploadedEmployees = new Set(salarySlips.filter(slip => 
    slip.month === currentMonth && slip.year === new Date().getFullYear()
  ).map(slip => slip.employeeCode));
  const pendingEmployees = EMPLOYEES.length - uploadedEmployees.size;

  // Filter employees for dropdown
  const filteredEmployees = EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.code.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <Ionicons name="card" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>Salary Slip Management</Text>
        <Text style={styles.headerSubtitle}>Upload and manage employee salary slips</Text>
      </LinearGradient>

      {/* Statistics Cards */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#006dc0', '#0088ff']}
              style={styles.statIconContainer}
            >
              <Ionicons name="document-text" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{totalSlips}</Text>
            <Text style={styles.statLabel}>Total Slips</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#10b981', '#34d399']}
              style={styles.statIconContainer}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{currentMonthSlips}</Text>
            <Text style={styles.statLabel}>{currentMonth}</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#f59e0b', '#fbbf24']}
              style={styles.statIconContainer}
            >
              <Ionicons name="time" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{pendingEmployees}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        >
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.uploadButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cloud-upload" size={24} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>Upload Salary Slip</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.text} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Month Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterMonth === 'All' && styles.filterChipActive]}
            onPress={() => setFilterMonth('All')}
          >
            <Text style={[styles.filterChipText, filterMonth === 'All' && styles.filterChipTextActive]}>
              All Months
            </Text>
          </TouchableOpacity>
          {MONTHS.map(month => (
            <TouchableOpacity
              key={month}
              style={[styles.filterChip, filterMonth === month && styles.filterChipActive]}
              onPress={() => setFilterMonth(month)}
            >
              <Text style={[styles.filterChipText, filterMonth === month && styles.filterChipTextActive]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Salary Slips List */}
        <View style={styles.slipsContainer}>
          <Text style={styles.sectionTitle}>
            Uploaded Slips ({filteredSlips.length})
          </Text>

          {filteredSlips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No salary slips found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || filterMonth !== 'All' 
                  ? 'Try adjusting your filters'
                  : 'Upload your first salary slip'}
              </Text>
            </View>
          ) : (
            filteredSlips.map(slip => (
              <View key={slip.id} style={styles.slipCard}>
                <View style={styles.slipHeader}>
                  <View style={styles.slipIconContainer}>
                    <LinearGradient
                      colors={['#006dc0', '#0088ff']}
                      style={styles.slipIcon}
                    >
                      <Ionicons name="document" size={24} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.slipInfo}>
                    <Text style={styles.slipEmployeeName}>{slip.employeeName}</Text>
                    <Text style={styles.slipEmployeeCode}>{slip.employeeCode}</Text>
                  </View>
                  <View style={styles.slipBadge}>
                    <Text style={styles.slipBadgeText}>{slip.status}</Text>
                  </View>
                </View>

                <View style={styles.slipDetails}>
                  <View style={styles.slipDetailItem}>
                    <Ionicons name="calendar" size={16} color={COLORS.text} />
                    <Text style={styles.slipDetailText}>
                      {slip.month} {slip.year}
                    </Text>
                  </View>
                  <View style={styles.slipDetailItem}>
                    <Ionicons name="cloud-upload" size={16} color={COLORS.text} />
                    <Text style={styles.slipDetailText}>
                      {slip.uploadDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.slipDetailItem}>
                    <Ionicons name="document-text" size={16} color={COLORS.text} />
                    <Text style={styles.slipDetailText} numberOfLines={1}>
                      {slip.fileName}
                    </Text>
                  </View>
                </View>

                <View style={styles.slipActions}>
                  <TouchableOpacity
                    style={styles.slipActionButton}
                    onPress={() => handleViewSlip(slip)}
                  >
                    <Ionicons name="eye" size={20} color={COLORS.primary} />
                    <Text style={styles.slipActionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.slipActionButton, styles.deleteButton]}
                    onPress={() => handleDeleteSlip(slip.id)}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                    <Text style={[styles.slipActionText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Salary Slip</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Employee Selector */}
              <Text style={styles.inputLabel}>Select Employee *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setEmployeeDropdownVisible(!employeeDropdownVisible)}
              >
                <Text style={[styles.dropdownText, !selectedEmployee && styles.placeholderText]}>
                  {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.code})` : 'Choose employee...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.text} />
              </TouchableOpacity>

              {employeeDropdownVisible && (
                <View style={styles.dropdownList}>
                  <View style={styles.dropdownSearchContainer}>
                    <Ionicons name="search" size={18} color={COLORS.text} />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search employee..."
                      value={employeeSearchQuery}
                      onChangeText={setEmployeeSearchQuery}
                      autoFocus
                    />
                    {employeeSearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setEmployeeSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView style={styles.dropdownScroll}>
                    {filteredEmployees.map(emp => (
                      <TouchableOpacity
                        key={emp.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedEmployee(emp);
                          setEmployeeDropdownVisible(false);
                          setEmployeeSearchQuery('');
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {emp.name} ({emp.code})
                        </Text>
                        <Text style={styles.dropdownItemSubtext}>{emp.designation}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Month Selector */}
              <Text style={styles.inputLabel}>Month *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
              >
                <Text style={styles.dropdownText}>{selectedMonth}</Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.text} />
              </TouchableOpacity>

              {monthDropdownVisible && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll}>
                    {MONTHS.map(month => (
                      <TouchableOpacity
                        key={month}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedMonth(month);
                          setMonthDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{month}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Year Selector */}
              <Text style={styles.inputLabel}>Year *</Text>
              <View style={styles.yearContainer}>
                {[2024, 2025, 2026].map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[styles.yearButtonText, selectedYear === year && styles.yearButtonTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* File Picker */}
              <Text style={styles.inputLabel}>PDF File *</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handlePickDocument}
              >
                <Ionicons name="document-attach" size={24} color={COLORS.primary} />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : 'Choose PDF file...'}
                </Text>
              </TouchableOpacity>

              {selectedFile && (
                <View style={styles.selectedFile}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.selectedFileText}>{selectedFile.name}</Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUploadSlip}
              >
                <LinearGradient
                  colors={[COLORS.primary, '#004A8D']}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>Upload Slip</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SalarySlipScreen;

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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: 5,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  uploadButton: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    paddingLeft: SPACING.lg,
    marginTop: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  slipsContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: SPACING.xs,
  },
  slipCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  slipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  slipIconContainer: {
    marginRight: SPACING.md,
  },
  slipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slipInfo: {
    flex: 1,
  },
  slipEmployeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  slipEmployeeCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  slipBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slipBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  slipDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  slipDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  slipDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  slipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slipActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#f0f9ff',
    flex: 1,
    marginRight: SPACING.sm,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    marginRight: 0,
    marginLeft: SPACING.sm,
  },
  slipActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteText: {
    color: '#ef4444',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 250,
    ...SHADOWS.card,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  dropdownSearchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  yearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearButton: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  yearButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  yearButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  yearButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
  },
  filePickerText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginLeft: SPACING.sm,
  },
  submitButtonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
