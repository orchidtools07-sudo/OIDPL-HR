import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import LocationToggle from '../components/LocationToggle';
import MapCard from '../components/MapCard';
import AnimatedMarquee from '../components/AnimatedMarquee';
import { updateEmployeeLocation, getEmployeeById } from '../utils/auth';
import { createLocationOffNotification } from '../utils/notifications';

const EmployeeDashboard = ({ route, navigation }) => {
  const [userData, setUserData] = useState(route?.params?.userData || null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [isOfficeHours, setIsOfficeHours] = useState(false);

  useEffect(() => {
    // Log the userData for debugging
    console.log('Employee Dashboard - userData:', userData);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    checkOfficeHours();
    
    // Get location immediately on login (no delay)
    console.log('🔵 User logged in - fetching location immediately');
    getCurrentLocation();
    
    // Check office hours every 1 minute for faster response
    const interval = setInterval(checkOfficeHours, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh employee data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (userData?.id) {
        const result = await getEmployeeById(userData.id);
        if (result.success) {
          setUserData(result.employee);
        }
      }
    });

    return unsubscribe;
  }, [navigation, userData?.id]);

  useEffect(() => {
    if (locationSharing && isOfficeHours && location) {
      // Update immediately when toggled on
      console.log('🟢 Location sharing enabled, updating to Firebase immediately');
      updateLocationToFirebase();
      // Then update every 30 seconds for instant real-time tracking
      const interval = setInterval(() => {
        console.log('🔄 Auto-updating location to Firebase');
        getCurrentLocation().then(() => {
          updateLocationToFirebase();
        });
      }, 30000); // Update every 30 seconds for instant updates
      return () => clearInterval(interval);
    }
  }, [locationSharing, isOfficeHours, location]);

  const checkOfficeHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    // Office hours: 10:30 AM (630 minutes) to 6:30 PM (1110 minutes)
    const startTime = 10 * 60 + 30; // 10:30 AM
    const endTime = 18 * 60 + 30;   // 6:30 PM
    
    const inOfficeHours = currentTime >= startTime && currentTime <= endTime;
    setIsOfficeHours(inOfficeHours);
    
    // Auto enable location sharing during office hours
    if (inOfficeHours && !locationSharing) {
      console.log('🕐 Office hours started, enabling location sharing');
      setLocationSharing(true);
      // Get fresh location when auto-enabled
      getCurrentLocation();
    }
    
    // Auto disable location sharing outside office hours
    if (!inOfficeHours && locationSharing) {
      console.log('🕐 Outside office hours, disabling location sharing');
      setLocationSharing(false);
      Alert.alert('Notice', 'Location sharing disabled outside office hours');
    }
  };

  const handleLocationToggle = async (value) => {
    if (!isOfficeHours) {
      Alert.alert(
        'Outside Office Hours',
        'Location sharing is only available during office hours (10:30 AM - 6:30 PM)',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Allow manual OFF only during office hours (for leave)
    if (!value) {
      setLocationSharing(false);
      // Create notification for admin
      if (userData) {
        createLocationOffNotification(userData);
      }
      Alert.alert('Notice', 'Location sharing disabled. Admin has been notified.');
    } else {
      setLocationSharing(true);
      // Get fresh location immediately when turned on
      console.log('🔵 Location toggle ON - fetching current location');
      await getCurrentLocation();
      // Update will happen in getCurrentLocation's callback
    }
  };

  const updateLocationToFirebase = async () => {
    if (location && userData?.id) {
      try {
        console.log('🔵 Updating location for employee:', userData.id, userData.name);
        console.log('📍 Location:', { lat: location.lat, lon: location.lon, address: address });
        
        await updateEmployeeLocation(userData.id, {
          lat: location.lat,
          lon: location.lon,
          address: address,
        }, {
          name: userData.name,
          code: userData.code,
          mobile: userData.mobile,
        });
        
        console.log('✅ Location updated successfully in Firebase');
      } catch (error) {
        console.error('❌ Error updating location:', error);
      }
    } else {
      console.log('⚠️ Cannot update location - missing data:', { location, userId: userData?.id });
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Use demo location for emulator/testing
        setLocation({
          lat: 28.4595,
          lon: 77.0266,
        });
        setAddress('OIDPL Office, Sector 51, Gurugram, Haryana (Demo Location)');
        setLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        lat: currentLocation.coords.latitude,
        lon: currentLocation.coords.longitude,
      };
      setLocation(newLocation);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      let newAddress = '';
      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const addressParts = [];
        
        if (place.name) addressParts.push(place.name);
        if (place.street) addressParts.push(place.street);
        if (place.district) addressParts.push(place.district);
        if (place.city) addressParts.push(place.city);
        if (place.region) addressParts.push(place.region);
        
        newAddress = addressParts.join(', ') || 'Location detected';
        setAddress(newAddress);
      } else {
        newAddress = `${currentLocation.coords.latitude.toFixed(4)}°, ${currentLocation.coords.longitude.toFixed(4)}°`;
        setAddress(newAddress);
      }

      setLoading(false);
      
      // If location sharing is ON and we're in office hours, update immediately
      if (locationSharing && isOfficeHours && userData?.id) {
        console.log('📍 Location fetched, updating to Firebase immediately');
        await updateEmployeeLocation(userData.id, {
          lat: newLocation.lat,
          lon: newLocation.lon,
          address: newAddress,
        }, {
          name: userData.name,
          code: userData.code,
          mobile: userData.mobile,
        });
      }
    } catch (err) {
      console.error('Error getting location:', err);
      // Use demo location as fallback
      setLocation({
        lat: 28.4595,
        lon: 77.0266,
      });
      setAddress('OIDPL Office, Sector 51, Gurugram, Haryana (Demo Location)');
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Hi 👋 Good Morning';
    if (hour < 17) return 'Hi 👋 Good Afternoon';
    return 'Hi 👋 Good Evening';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Profile Section */}
        <LinearGradient
          colors={[COLORS.primary, '#004A8D']}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileLeft}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('EditProfile', { userData })}
              >
                {userData?.profileImage ? (
                  <Image 
                    source={{ uri: userData.profileImage }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{userData?.name?.charAt(0) || 'E'}</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={12} color={COLORS.white} />
                </View>
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.profileName}>{userData?.name || 'Employee'}</Text>
                <Text style={styles.profileCode}>{userData?.code || 'N/A'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings', { userData })}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Location Sharing Section */}
        <View style={styles.locationSharingCard}>
          <View style={styles.locationSharingHeader}>
            <View>
              <Text style={styles.locationSharingTitle}>Location Sharing</Text>
              <Text style={styles.locationSharingSubtitle}>
                {isOfficeHours ? 'Office hours active' : 'Outside office hours'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                locationSharing && styles.toggleButtonActive,
                !isOfficeHours && styles.toggleButtonDisabled
              ]}
              onPress={() => handleLocationToggle(!locationSharing)}
              disabled={!isOfficeHours}
            >
              <Ionicons 
                name={locationSharing ? "location" : "location-outline"} 
                size={24} 
                color={locationSharing ? COLORS.white : COLORS.darkGray} 
              />
              <Text style={[
                styles.toggleButtonText,
                locationSharing && styles.toggleButtonTextActive
              ]}>
                {locationSharing ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.infoText}>
            {locationSharing 
              ? '✓ Your location is being shared with HR'
              : !isOfficeHours
              ? '⏰ Location sharing only during office hours (10:30 AM - 6:30 PM)'
              : '⚠ Turn ON when you are working. Turn OFF when on leave.'}
          </Text>
        </View>

        <AnimatedMarquee 
          text="🔒 Don't worry, your location is shared with HR only during office hours (10:30 AM – 6:30 PM)"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Current Location</Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : location ? (
          <>
            <MapCard
              latitude={location.lat}
              longitude={location.lon}
              title="You are here"
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{address}</Text>
            </View>
          </>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Unable to fetch location</Text>
            <Text style={styles.errorSubtext}>{error || 'Please enable location permissions'}</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  profileCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONTS.sizes.xxxlarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: FONTS.sizes.small,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    fontWeight: '400',
  },
  profileName: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs / 2,
  },
  profileCode: {
    fontSize: FONTS.sizes.medium,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSharingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  locationSharingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationSharingTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationSharingSubtitle: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginTop: SPACING.xs / 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  toggleButtonText: {
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  infoText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  greeting: {
    fontSize: FONTS.sizes.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subGreeting: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationInfo: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  locationText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
  },
  errorCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  errorText: {
    fontSize: FONTS.sizes.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  errorSubtext: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});

export default EmployeeDashboard;
