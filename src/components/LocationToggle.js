import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const LocationToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const toggleSwitch = () => {
    // Animate text change
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setIsEnabled(previousState => !previousState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Location Sharing</Text>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.status, isEnabled ? styles.statusOn : styles.statusOff]}>
              {isEnabled ? 'Location Sharing ON' : 'Location Sharing OFF'}
            </Text>
          </Animated.View>
        </View>
        <Switch
          trackColor={{ false: COLORS.darkGray, true: COLORS.primary }}
          thumbColor={isEnabled ? COLORS.secondary : COLORS.gray}
          ios_backgroundColor={COLORS.darkGray}
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  status: {
    fontSize: FONTS.sizes.small,
    fontWeight: '500',
  },
  statusOn: {
    color: COLORS.success,
  },
  statusOff: {
    color: COLORS.error,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});

export default LocationToggle;
