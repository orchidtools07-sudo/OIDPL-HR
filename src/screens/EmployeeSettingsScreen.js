import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { updateEmployeePassword } from '../utils/auth';

const EmployeeSettingsScreen = ({ route, navigation }) => {
  const userData = route?.params?.userData;
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContactHR = () => {
    Linking.openURL('tel:+919310088074');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }

    if (currentPassword !== userData?.password) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await updateEmployeePassword(userData.id, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            setShowChangePassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } else {
      Alert.alert('Error', result.message || 'Failed to change password');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.headerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
          <View style={styles.editIconBadge}>
            <Ionicons name="camera" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerName}>{userData?.name || 'Employee'}</Text>
        <Text style={styles.headerCode}>{userData?.code || 'N/A'}</Text>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile', { userData })}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.white} />
          <Text style={styles.editProfileText}>Edit Profile Picture</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{userData?.name || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Employee Code</Text>
              <Text style={styles.detailValue}>{userData?.code || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Mobile Number</Text>
              <Text style={styles.detailValue}>{userData?.mobile || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Designation</Text>
              <Text style={styles.detailValue}>{userData?.designation || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{userData?.department || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Current Password</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.detailValue}>
                  {showPassword ? userData?.password : '••••••••'}
                </Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.darkGray} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <Ionicons name="key-outline" size={18} color={COLORS.primary} />
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.changePasswordForm}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-open-outline" size={18} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.updatePasswordButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.updatePasswordText}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Contact HR Button */}
      <TouchableOpacity 
        style={styles.contactHRButton}
        onPress={handleContactHR}
      >
        <LinearGradient
          colors={[COLORS.primary, '#004A8D']}
          style={styles.contactHRGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="headset-outline" size={24} color={COLORS.white} />
          <Text style={styles.contactHRText}>Contact HR</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Info Note */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.infoText}>
          If you need to update your profile details, please contact HR department
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 20,
  },
  headerCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerName: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerCode: {
    fontSize: FONTS.sizes.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  editProfileText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  detailContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  changePasswordText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  changePasswordForm: {
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
  },
  updatePasswordButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.small,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  updatePasswordText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.white,
    fontWeight: '600',
  },
  contactHRButton: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  contactHRGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  contactHRText: {
    fontSize: FONTS.sizes.large,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  infoCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginLeft: SPACING.md,
    lineHeight: 20,
  },
});

export default EmployeeSettingsScreen;
