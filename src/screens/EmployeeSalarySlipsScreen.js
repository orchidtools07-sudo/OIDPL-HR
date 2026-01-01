import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getEmployeeSalarySlips } from '../utils/auth';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EmployeeSalarySlipsScreen = ({ route }) => {
  const { userData } = route?.params || {};
  const [salarySlips, setSalarySlips] = useState([]);
  const [filterYear, setFilterYear] = useState(2025);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalarySlips();
  }, []);

  const loadSalarySlips = async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getEmployeeSalarySlips(userData.id);
    if (result.success) {
      setSalarySlips(result.slips);
    }
    setLoading(false);
  };

  const handleDownloadSlip = (slip) => {
    Alert.alert(
      'Download Salary Slip',
      `Download ${slip.month} ${slip.year} salary slip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // In real app, this would download the PDF
            Alert.alert('Success', 'Salary slip downloaded successfully');
          },
        },
      ]
    );
  };

  const handleViewSlip = (slip) => {
    Alert.alert(
      'View Salary Slip',
      `Month: ${slip.month} ${slip.year}\nUploaded: ${slip.uploadDate.toLocaleDateString()}\n\nFile: ${slip.fileName}`,
      [{ text: 'OK' }]
    );
  };

  const filteredSlips = salarySlips.filter(slip => slip.year === filterYear);

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, '#004A8D']}
          style={styles.header}
        >
          <Ionicons name="card" size={48} color={COLORS.white} />
          <Text style={styles.headerTitle}>My Salary Slips</Text>
          <Text style={styles.headerSubtitle}>View and download your salary slips</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading salary slips...</Text>
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
        <Ionicons name="card" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>My Salary Slips</Text>
        <Text style={styles.headerSubtitle}>View and download your salary slips</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#006dc0', '#0088ff']}
              style={styles.statGradient}
            >
              <Ionicons name="document-text" size={32} color={COLORS.white} />
              <Text style={styles.statValue}>{salarySlips.length}</Text>
              <Text style={styles.statLabel}>Total Slips</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Year Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Select Year:</Text>
          <View style={styles.yearButtons}>
            {[2024, 2025, 2026].map(year => (
              <TouchableOpacity
                key={year}
                style={[styles.yearButton, filterYear === year && styles.yearButtonActive]}
                onPress={() => setFilterYear(year)}
              >
                <Text style={[styles.yearButtonText, filterYear === year && styles.yearButtonTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Salary Slips List */}
        <View style={styles.slipsContainer}>
          <Text style={styles.sectionTitle}>Salary Slips ({filteredSlips.length})</Text>

          {filteredSlips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No salary slips available</Text>
              <Text style={styles.emptyStateSubtext}>
                Slips will appear here once uploaded by HR
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
                      <Ionicons name="document" size={28} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.slipInfo}>
                    <Text style={styles.slipMonth}>{slip.month} {slip.year}</Text>
                    <Text style={styles.slipDate}>
                      Uploaded on {slip.uploadDate.toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.downloadButtonFull}
                  onPress={() => handleDownloadSlip(slip)}
                >
                  <Ionicons name="cloud-download" size={20} color={COLORS.white} />
                  <Text style={styles.downloadButtonText}>
                    Download
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployeeSalarySlipsScreen;

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
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
    justifyContent: 'center',
  },
  statCard: {
    width: '45%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  statGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  yearButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  yearButton: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
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
    textAlign: 'center',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slipInfo: {
    flex: 1,
  },
  slipMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  slipDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  salaryInfo: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  salaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  salaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: SPACING.sm,
  },
  salaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  salaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  netSalary: {
    color: '#10b981',
  },
  slipActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#f0f9ff',
  },
  actionButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
});
