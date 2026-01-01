import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getEmployeeById, deleteEmployee } from '../utils/auth';

const EmployeeDetailScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployee();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEmployee();
    });
    return unsubscribe;
  }, [navigation]);

  const loadEmployee = async () => {
    setLoading(true);
    const result = await getEmployeeById(employeeId);
    if (result.success) {
      setEmployee(result.employee);
    } else {
      Alert.alert('Error', 'Failed to load employee details');
    }
    setLoading(false);
  };

  const handleDeleteEmployee = () => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            const result = await deleteEmployee(employeeId);
            setLoading(false);
            if (result.success) {
              Alert.alert('Success', 'Employee deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('EmployeeTracking'),
                },
              ]);
            } else {
              Alert.alert('Error', result.message || 'Failed to delete employee');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Employee not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.headerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {employee?.profileImage ? (
              <Image 
                source={{ uri: employee.profileImage }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{employee?.name?.charAt(0) || 'E'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerName}>{employee?.name || 'Employee'}</Text>
          <Text style={styles.headerCode}>{employee?.code || 'N/A'}</Text>
          
          {/* Edit Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditEmployee', { employee })}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.white} />
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Employee Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditEmployee', { employee })}>
            <Ionicons name="create" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailCard}>
          <DetailRow icon="person-outline" label="Full Name" value={employee?.name} />
          <DetailRow icon="id-card-outline" label="Employee Code" value={employee?.code} />
          <DetailRow icon="call-outline" label="Mobile Number" value={employee?.mobile} />
          <DetailRow icon="briefcase-outline" label="Designation" value={employee?.designation} />
          <DetailRow icon="business-outline" label="Department" value={employee?.department} />
          <DetailRow 
            icon="shield-checkmark-outline" 
            label="Status" 
            value={employee?.active ? 'Active' : 'Inactive'}
            valueColor={employee?.active ? '#4CAF50' : '#F44336'}
          />
        </View>
      </View>

      {/* Current Location */}
      {employee?.location && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Location</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EmployeeMap', { 
                employee: {
                  ...employee,
                  lat: employee.location.lat,
                  lon: employee.location.lon,
                  location: employee.location.address
                }
              })}
            >
              <Ionicons name="map-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailCard}>
            <DetailRow 
              icon="location-outline" 
              label="Address" 
              value={employee.location.address || 'Not available'} 
            />
            <DetailRow 
              icon="navigate-outline" 
              label="Coordinates" 
              value={`${employee.location.lat?.toFixed(6)}, ${employee.location.lon?.toFixed(6)}`} 
            />
            <DetailRow 
              icon="time-outline" 
              label="Last Updated" 
              value={employee.location.lastUpdated ? new Date(employee.location.lastUpdated).toLocaleString() : 'Never'} 
            />
          </View>
        </View>
      )}

      {/* Account Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        
        <View style={styles.detailCard}>
          <DetailRow 
            icon="calendar-outline" 
            label="Created At" 
            value={employee?.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'} 
          />
          <DetailRow 
            icon="sync-outline" 
            label="Last Updated" 
            value={employee?.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : 'Never'} 
          />
          <DetailRow 
            icon="key-outline" 
            label="Password" 
            value="••••••••" 
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EmployeeMap', { 
            employee: {
              ...employee,
              lat: employee.location?.lat,
              lon: employee.location?.lon,
              location: employee.location?.address
            }
          })}
        >
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="map" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditEmployee', { employee })}
        >
          <LinearGradient
            colors={[COLORS.secondary, '#D4B843']}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="create" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Edit Employee</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteEmployee}
      >
        <LinearGradient
          colors={['#F44336', '#D32F2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.deleteButtonGradient}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.deleteButtonText}>Delete Employee</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>
        {value || 'N/A'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  headerCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerName: {
    fontSize: FONTS.sizes.xxlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerCode: {
    fontSize: FONTS.sizes.large,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: SPACING.sm,
  },
  editButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  detailContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  deleteButton: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.card,
    marginBottom: SPACING.xl,
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EmployeeDetailScreen;
