import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONTS } from '../constants/theme';
import { getStaticMapUrl, getGoogleMapsUrl } from '../constants/config';

const MapCard = ({ latitude, longitude, title = "You are here" }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const mapUrl = getStaticMapUrl(latitude, longitude, 15, 600, 400, true);

  const handleOpenInMaps = () => {
    const url = getGoogleMapsUrl(latitude, longitude);
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleOpenInMaps} activeOpacity={0.9}>
      <Image
        source={{ uri: mapUrl }}
        style={styles.mapImage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="location" size={60} color={COLORS.primary} />
          <Text style={styles.errorText}>Map unavailable</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Ionicons name="location" size={16} color={COLORS.white} />
          <Text style={styles.badgeText}>{title}</Text>
        </View>
      </View>
      <View style={styles.openButton}>
        <Ionicons name="open-outline" size={18} color={COLORS.primary} />
        <Text style={styles.openText}>Tap to open</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.card,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
  },
  overlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    ...SHADOWS.card,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    marginLeft: 4,
  },
  openButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    ...SHADOWS.card,
  },
  openText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default MapCard;
