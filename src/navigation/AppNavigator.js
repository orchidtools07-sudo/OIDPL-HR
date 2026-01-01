import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import CustomDrawer from '../components/CustomDrawer';
import CustomEmployeeDrawer from '../components/CustomEmployeeDrawer';

// Screens
import LoginScreen from '../screens/LoginScreen';
import EmployeeDashboard from '../screens/EmployeeDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import EmployeeTrackingScreen from '../screens/EmployeeTrackingScreen';
import EmployeeMapScreen from '../screens/EmployeeMapScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AdminNotificationsScreen from '../screens/AdminNotificationsScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EmployeeSettingsScreen from '../screens/EmployeeSettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import EditEmployeeScreen from '../screens/EditEmployeeScreen';
import LeaveManagementScreen from '../screens/LeaveManagementScreen';
import SalarySlipScreen from '../screens/SalarySlipScreen';
import HolidayListScreen from '../screens/HolidayListScreen';
import EmployeeLeavesScreen from '../screens/EmployeeLeavesScreen';
import EmployeeSalarySlipsScreen from '../screens/EmployeeSalarySlipsScreen';
import EmployeeHolidaysScreen from '../screens/EmployeeHolidaysScreen';
import ApplyLeaveScreen from '../screens/ApplyLeaveScreen';

const Stack = createStackNavigator();

// Employee Stack Navigator with Custom Drawer
function EmployeeStack({ route }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('EmployeeDashboard');
  const navigationRef = React.useRef(null);
  const userData = route?.params?.userData;

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="EmployeeDashboard"
          component={EmployeeDashboard}
          initialParams={{ userData: userData }}
          listeners={{
            focus: () => setCurrentRoute('EmployeeDashboard'),
          }}
          options={({ navigation }) => ({
            title: 'Dashboard',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications', { userData: userData })}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="notifications" size={24} color={COLORS.white} />
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          initialParams={{ userData: userData }}
          options={{
            title: 'Notifications',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={EmployeeSettingsScreen}
          initialParams={{ userData: userData }}
          listeners={{
            focus: () => setCurrentRoute('Settings'),
          }}
          options={({ navigation }) => ({
            title: 'Settings',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="EmployeeLeaves"
          component={EmployeeLeavesScreen}
          listeners={{
            focus: () => setCurrentRoute('EmployeeLeaves'),
          }}
          options={({ navigation }) => ({
            title: 'Leave Management',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ApplyLeave"
          component={ApplyLeaveScreen}
          options={{
            title: 'Apply for Leave',
          }}
        />
        <Stack.Screen
          name="EmployeeSalarySlips"
          component={EmployeeSalarySlipsScreen}
          listeners={{
            focus: () => setCurrentRoute('EmployeeSalarySlips'),
          }}
          options={({ navigation }) => ({
            title: 'Salary Slips',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EmployeeHolidays"
          component={EmployeeHolidaysScreen}
          listeners={{
            focus: () => setCurrentRoute('EmployeeHolidays'),
          }}
          options={({ navigation }) => ({
            title: 'Holiday List',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>

      <CustomEmployeeDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigationRef.current}
        activeRoute={currentRoute}
        userData={userData}
      />
    </>
  );
}

// Admin Stack Navigator with Custom Drawer
function AdminStack() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('AdminDashboard');
  const navigationRef = React.useRef(null);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          listeners={{
            focus: () => setCurrentRoute('AdminDashboard'),
          }}
          options={({ navigation }) => ({
            title: 'Admin Dashboard',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="notifications" size={24} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EmployeeTracking"
          component={EmployeeTrackingScreen}
          listeners={{
            focus: () => setCurrentRoute('EmployeeTracking'),
          }}
          options={({ navigation }) => ({
            title: 'Employee Tracking',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="LeaveManagement"
          component={LeaveManagementScreen}
          listeners={{
            focus: () => setCurrentRoute('LeaveManagement'),
          }}
          options={({ navigation }) => ({
            title: 'Leave Management',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="SalarySlip"
          component={SalarySlipScreen}
          listeners={{
            focus: () => setCurrentRoute('SalarySlip'),
          }}
          options={({ navigation }) => ({
            title: 'Salary Slip',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="HolidayList"
          component={HolidayListScreen}
          listeners={{
            focus: () => setCurrentRoute('HolidayList'),
          }}
          options={({ navigation }) => ({
            title: 'Holiday List',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="AddEmployee"
          component={AddEmployeeScreen}
          listeners={{
            focus: () => setCurrentRoute('AddEmployee'),
          }}
          options={({ navigation }) => ({
            title: 'Add Employee',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EmployeeMap"
          component={EmployeeMapScreen}
          options={{
            title: 'Employee Location',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={AdminNotificationsScreen}
          options={({ navigation }) => ({
            title: 'Notifications',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EmployeeDetail"
          component={EmployeeDetailScreen}
          options={({ navigation }) => ({
            title: 'Employee Details',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EditEmployee"
          component={EditEmployeeScreen}
          options={({ navigation }) => ({
            title: 'Edit Employee',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigationRef.current = navigation;
                  setDrawerVisible(true);
                }}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
      
      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigationRef.current}
        currentRoute={currentRoute}
      />
    </>
  );
}

// Root Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EmployeeDashboard" component={EmployeeStack} />
        <Stack.Screen name="AdminDashboard" component={AdminStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
