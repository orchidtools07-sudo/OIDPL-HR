import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CustomDrawer = ({ visible, onClose, navigation, currentRoute }) => {
  const slideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', route: 'AdminDashboard' },
    { name: 'Employee Tracking', icon: 'people-outline', route: 'EmployeeTracking' },
    { name: 'Leave Management', icon: 'calendar-outline', route: 'LeaveManagement' },
    { name: 'Salary Slip', icon: 'card-outline', route: 'SalarySlip' },
    { name: 'Holiday List', icon: 'sunny-outline', route: 'HolidayList' },
    { name: 'Add Employee', icon: 'person-add-outline', route: 'AddEmployee' },
  ];

  const handleNavigation = (route) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(route);
    }, 300);
  };

  const handleLogout = () => {
    onClose();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.header}
          >
            <View style={styles.profileSection}>
              <LinearGradient
                colors={[COLORS.secondary, '#D4B843']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>A</Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.adminName}>Administrator</Text>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark" size={12} color={COLORS.secondary} />
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>MAIN MENU</Text>
            {menuItems.map((item, index) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNavigation(item.route)}
                >
                  {isActive && (
                    <LinearGradient
                      colors={[COLORS.primary, '#004A8D']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                    <Ionicons name={item.icon} size={20} color={isActive ? COLORS.white : COLORS.primary} />
                  </View>
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                    {item.name}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.logoutGradient}>
                <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>OIDPL HR Manager</Text>
              <Text style={styles.footerVersion}>v1.0.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
        
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    width: 280,
    height: '100%',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: SPACING.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247,207,73,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    padding: 5,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkGray,
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: 8,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuItemActive: {
    backgroundColor: COLORS.primary,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,109,192,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconBoxActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  menuTextActive: {
    color: COLORS.white,
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 2,
  },
});

export default CustomDrawer;
