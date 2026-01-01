import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CustomEmployeeDrawer = ({ visible, onClose, navigation, activeRoute, userData }) => {
  const slideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            onClose();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: 1, title: 'Dashboard', icon: 'speedometer', screen: 'EmployeeDashboard' },
    { id: 2, title: 'Leave Management', icon: 'calendar', screen: 'EmployeeLeaves' },
    { id: 3, title: 'Salary Slips', icon: 'card', screen: 'EmployeeSalarySlips' },
    { id: 4, title: 'Holiday List', icon: 'today', screen: 'EmployeeHolidays' },
    { id: 5, title: 'Settings', icon: 'settings', screen: 'Settings' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.header}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userData?.name?.charAt(0) || 'E'}</Text>
            </View>
            <Text style={styles.userName}>{userData?.name || 'Employee'}</Text>
            <Text style={styles.userEmail}>{userData?.email || userData?.mobile || 'N/A'}</Text>
          </LinearGradient>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  activeRoute === item.screen && styles.activeMenuItem
                ]}
                onPress={() => {
                  onClose();
                  navigation.navigate(item.screen, { userData });
                }}
              >
                <View style={[
                  styles.iconContainer,
                  activeRoute === item.screen && styles.activeIconContainer
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={activeRoute === item.screen ? COLORS.primary : COLORS.text}
                  />
                </View>
                <Text style={[
                  styles.menuText,
                  activeRoute === item.screen && styles.activeMenuText
                ]}>
                  {item.title}
                </Text>
                {activeRoute === item.screen && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}

            {/* Logout */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="log-out" size={22} color="#ef4444" />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: 280,
    height: '100%',
    backgroundColor: COLORS.white,
    ...SHADOWS.card,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 40,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: '#f0f9ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activeIconContainer: {
    backgroundColor: '#dbeafe',
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  activeMenuText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '70%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  logoutItem: {
    marginTop: 'auto',
    marginBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: SPACING.lg,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default CustomEmployeeDrawer;
