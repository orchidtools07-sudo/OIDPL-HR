import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getStaticMapUrl, getGoogleMapsUrl } from '../constants/config';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const EmployeeMapScreen = ({ route, navigation }) => {
  const [employee, setEmployee] = useState(route.params.employee);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Set up real-time location listener
  useEffect(() => {
    const employeeRef = ref(database, `employees/${employee.id}`);
    const unsubscribe = onValue(employeeRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedEmployee = { id: employee.id, ...snapshot.val() };
        setEmployee(updatedEmployee);
        setLastRefreshTime(new Date());
      }
    });
    
    return () => unsubscribe();
  }, [employee.id]);

  // Get location from employee data
  const latitude = employee.location?.lat || employee.lat || 28.4595;
  const longitude = employee.location?.lon || employee.lon || 77.0266;
  const locationAddress = employee.location?.address || employee.location || 'Location not available';

  const mapUrl = getStaticMapUrl(latitude, longitude, 16, 800, 800, true);

  const handleRefreshLocation = async () => {
    setRefreshing(true);
    setLastRefreshTime(new Date());
    // The real-time listener will automatically update the location
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleOpenInGoogleMaps = () => {
    const url = getGoogleMapsUrl(latitude, longitude);
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Map Display */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: mapUrl }}
          key={`${latitude}-${longitude}`}
          style={styles.mapImage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshLocation}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="refresh" size={24} color={COLORS.white} />
          )}
        </TouchableOpacity>

        {/* Open in Maps Button */}
        <TouchableOpacity
          style={styles.openMapButton}
          onPress={handleOpenInGoogleMaps}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.openMapGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="navigate" size={20} color={COLORS.white} />
            <Text style={styles.openMapText}>Open in Google Maps</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Employee Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{employee.name.charAt(0)}</Text>
          </LinearGradient>
          <View style={styles.cardInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeCode}>{employee.code}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>{employee.mobile}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="briefcase" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>{employee.designation || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>{locationAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="navigate" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>
              {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={16} color={COLORS.darkGray} />
            </View>
            <Text style={styles.timestampText}>
              Last updated: {lastRefreshTime.toLocaleString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  refreshButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md + 54,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  openMapButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.md,
    borderRadius: 25,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  openMapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 2,
  },
  openMapText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    ...SHADOWS.card,
    shadowOpacity: 0.15,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  employeeName: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  employeeCode: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  cardDetails: {
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.medium,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  timestampText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    fontWeight: '400',
    flex: 1,
  },
});

export default EmployeeMapScreen;
