import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const AdminDrawerContent = (props) => {
  const { navigation } = props;
  const [selectedItem, setSelectedItem] = React.useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', route: 'AdminDashboard' },
    { name: 'Employee Tracking', icon: 'people-outline', route: 'EmployeeTracking' },
    { name: 'Leave Management', icon: 'calendar-outline', route: 'LeaveManagement' },
    { name: 'Salary Slip', icon: 'card-outline', route: 'SalarySlip' },
    { name: 'Holiday List', icon: 'sunny-outline', route: 'HolidayList' },
    { name: 'Add Employee', icon: 'person-add-outline', route: 'AddEmployee' },
  ];

  const handleNavigation = (item) => {
    setSelectedItem(item.name);
    navigation.navigate(item.route);
  };

  const handleLogout = () => {
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.secondary, '#D4B843']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>A</Text>
            </LinearGradient>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.adminName}>Administrator</Text>
            <View style={styles.badgeContainer}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.secondary} />
              <Text style={styles.badgeText}>Admin Access</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>MAIN MENU</Text>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              isSelected={selectedItem === item.name}
              onPress={() => handleNavigation(item)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="person-add-outline"
              title="Add Employee"
              gradient={['#4CAF50', '#388E3C']}
              onPress={() => navigation.navigate('AddEmployee')}
            />
            <QuickActionButton
              icon="calendar-outline"
              title="Manage Leave"
              gradient={['#2196F3', '#1976D2']}
              onPress={() => navigation.navigate('LeaveManagement')}
            />
            <QuickActionButton
              icon="document-text-outline"
              title="Generate Report"
              gradient={['#FF9800', '#F57C00']}
              onPress={() => Alert.alert('Coming Soon', 'Report generation feature will be available soon.')}
            />
            <QuickActionButton
              icon="stats-chart-outline"
              title="Analytics"
              gradient={['#9C27B0', '#7B1FA2']}
              onPress={() => Alert.alert('Coming Soon', 'Analytics dashboard coming soon.')}
            />
          </View>
        </View>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.notificationItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.menuItemText}>Notifications</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>OIDPL HR Manager</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({ item, isSelected, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.menuItem, isSelected && styles.menuItemSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {isSelected && (
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.menuItemGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <Ionicons 
            name={item.icon} 
            size={22} 
            color={isSelected ? COLORS.white : COLORS.primary} 
          />
        </View>
        <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.selectedIndicator} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickActionButton = ({ icon, title, gradient, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradient}
          style={styles.quickActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <View style={styles.quickActionIconContainer}>
              <Ionicons name={icon} size={24} color={COLORS.white} />
            </View>
          </Animated.View>
          <Text style={styles.quickActionTitle} numberOfLines={2}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: SPACING.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.card,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 207, 73, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  menuSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
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
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    marginBottom: 8,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuItemSelected: {
    backgroundColor: COLORS.primary,
  },
  menuItemGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 109, 192, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  menuItemTextSelected: {
    color: COLORS.white,
  },
  selectedIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  quickActionsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47.5%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  quickActionGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.card,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 109, 192, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  logoutButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
});

export default AdminDrawerContent;
