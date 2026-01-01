import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getAllEmployees } from '../utils/auth';
import { cleanupOldLocationHistory } from '../utils/reportGenerator';
import { getUnreadNotificationsCount } from '../utils/notifications';
import EmployeeCard from '../components/EmployeeCard';

const AdminDashboard = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(0));
  const [displayCount, setDisplayCount] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchUnreadNotifications();
    
    // Defer cleanup to not block initial load
    setTimeout(() => {
      cleanupOldLocationHistory();
    }, 5000);
    
    // Check for new notifications every 60 seconds (reduced frequency)
    const notificationInterval = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(notificationInterval);
  }, []);

  // Refresh notification count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadNotifications();
    }, [])
  );
  
  const fetchUnreadNotifications = async () => {
    const result = await getUnreadNotificationsCount();
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(countAnim, {
        toValue: employees.length,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();

    const listener = countAnim.addListener(({ value }) => {
      setDisplayCount(Math.floor(value));
    });

    return () => countAnim.removeListener(listener);
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const result = await getAllEmployees();
      if (result.success) {
        setEmployees(result.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMap = (employee) => {
    navigation.navigate('EmployeeMap', { employee });
  };

  const handleViewDetails = (employee) => {
    navigation.navigate('EmployeeDetail', { employeeId: employee.id });
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D', '#003366']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.subGreeting}>Workforce Analytics & Management</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerIconContainer}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="people" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{displayCount}</Text>
                  <Text style={styles.statLabel}>TOTAL EMPLOYEES</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{displayCount}</Text>
                  <Text style={styles.statLabel}>ACTIVE TODAY</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Team Members</Text>
              <Text style={styles.sectionSubtitle}>Recent activity</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddEmployee')}
              >
                <Ionicons name="add-circle" size={18} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('EmployeeTracking')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Employee List - Enhanced Cards */}
          {loading ? (
            <Text style={styles.loadingText}>Loading employees...</Text>
          ) : employees.length === 0 ? (
            <Text style={styles.noDataText}>No employees found. Add your first employee!</Text>
          ) : (
            employees.slice(0, 5).map((employee, index) => (
              <View key={employee.id} style={styles.employeeCardWrapper}>
                <TouchableOpacity 
                  style={styles.employeeCard}
                  onPress={() => handleViewDetails(employee)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardLeft}>
                    <LinearGradient
                      colors={index % 2 === 0 ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>{employee.name.charAt(0)}</Text>
                    </LinearGradient>
                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>{employee.name}</Text>
                      <View style={styles.employeeMetaRow}>
                        <Text style={styles.employeeCode}>{employee.code}</Text>
                        <View style={styles.dotSeparator} />
                        <Ionicons name="call-outline" size={11} color={COLORS.darkGray} />
                        <Text style={styles.employeeMobile}>{employee.mobile}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={14} color={COLORS.primary} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {employee.location?.address || 'Not set'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* View All Button */}
          {!loading && employees.length > 0 && (
            <TouchableOpacity
              style={styles.viewAllEmployeesButton}
              onPress={() => navigation.navigate('EmployeeTracking')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, '#004A8D']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="people" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.viewAllEmployeesText}>View All Employees</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    paddingTop: SPACING.xl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg + 4,
    paddingBottom: SPACING.xl + 20,
  },
  statsContainer: {
    marginBottom: SPACING.md,
  },
  statCardWrapper: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  statCard: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    lineHeight: 13,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg + 4,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    ...SHADOWS.card,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  miniStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  miniStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md + 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
    fontWeight: '400',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: 4,
    fontWeight: '700',
  },
  employeeCardWrapper: {
    marginBottom: SPACING.md,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.large,
    ...SHADOWS.card,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  employeeInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  employeeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeCode: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.darkGray,
    marginHorizontal: 6,
  },
  employeeMobile: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginLeft: 3,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: 14,
    maxWidth: 90,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.primary,
    marginLeft: 3,
    fontWeight: '600',
  },
  viewAllEmployeesButton: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 4,
  },
  viewAllEmployeesText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.medium,
    paddingVertical: SPACING.xl,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.medium,
    paddingVertical: SPACING.xl,
  },
});

export default AdminDashboard;
