import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const SimpleAdminDrawer = (props) => {
  const { navigation } = props;
  const [activeRoute, setActiveRoute] = React.useState('AdminDashboard');

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      setActiveRoute(currentRoute.name);
    });
    return unsubscribe;
  }, [navigation]);

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', route: 'AdminDashboard' },
    { name: 'Employee Tracking', icon: 'people-outline', route: 'EmployeeTracking' },
    { name: 'Leave Management', icon: 'calendar-outline', route: 'LeaveManagement' },
    { name: 'Salary Slip', icon: 'card-outline', route: 'SalarySlip' },
    { name: 'Holiday List', icon: 'sunny-outline', route: 'HolidayList' },
    { name: 'Add Employee', icon: 'person-add-outline', route: 'AddEmployee' },
  ];

  const handleNavigation = (route) => {
    setActiveRoute(route);
    navigation.navigate(route);
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
          {menuItems.map((item, index) => {
            const isActive = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.7}
              >
                {isActive && (
                  <LinearGradient
                    colors={[COLORS.primary, '#004A8D']}
                    style={styles.menuItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                )}
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={isActive ? COLORS.white : COLORS.primary} 
                  />
                </View>
                <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                  {item.name}
                </Text>
                {isActive && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
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
  menuItemActive: {
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
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  menuItemTextActive: {
    color: COLORS.white,
  },
  selectedIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
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

export default SimpleAdminDrawer;
