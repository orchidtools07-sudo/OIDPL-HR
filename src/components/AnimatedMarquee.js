import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const AnimatedMarquee = ({ text }) => {
  const translateX = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -300,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 300,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: SPACING.sm,
    overflow: 'hidden',
    borderRadius: 8,
    marginVertical: SPACING.md,
  },
  text: {
    fontSize: FONTS.sizes.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default AnimatedMarquee;
