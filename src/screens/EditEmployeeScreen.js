import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { updateEmployeeProfile, uploadProfilePicture } from '../utils/auth';

const EditEmployeeScreen = ({ route, navigation }) => {
  const { employee } = route.params;
  const [name, setName] = useState(employee?.name || '');
  const [code, setCode] = useState(employee?.code || '');
  const [mobile, setMobile] = useState(employee?.mobile || '');
  const [designation, setDesignation] = useState(employee?.designation || '');
  const [department, setDepartment] = useState(employee?.department || '');
  const [password, setPassword] = useState(employee?.password || '');
  const [active, setActive] = useState(employee?.active !== false);
  const [profileImage, setProfileImage] = useState(employee?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUploading(true);
      const uploadResult = await uploadProfilePicture(employee.id, result.assets[0].uri);
      setUploading(false);
      
      if (uploadResult.success) {
        setProfileImage(uploadResult.imageUrl);
        Alert.alert('Success', 'Profile picture uploaded');
      } else {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Error', 'Employee code is required');
      return;
    }
    if (!mobile.trim()) {
      Alert.alert('Error', 'Mobile number is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    setLoading(true);
    
    const result = await updateEmployeeProfile(employee.id, {
      name: name.trim(),
      code: code.trim(),
      mobile: mobile.trim(),
      designation: designation.trim(),
      department: department.trim(),
      password: password.trim(),
      active: active,
      profileImage: profileImage,
    });
    
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Employee updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', result.message || 'Failed to update employee');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Employee</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
            disabled={uploading}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>
                  {name?.charAt(0) || 'E'}
                </Text>
              </View>
            )}
            
            <View style={styles.editBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="camera" size={16} color={COLORS.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Tap to change profile picture</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <InputField
            label="Full Name *"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />

          <InputField
            label="Employee Code *"
            icon="id-card-outline"
            value={code}
            onChangeText={setCode}
            placeholder="Enter employee code"
          />

          <InputField
            label="Mobile Number *"
            icon="call-outline"
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />

          <InputField
            label="Designation"
            icon="briefcase-outline"
            value={designation}
            onChangeText={setDesignation}
            placeholder="Enter designation"
          />

          <InputField
            label="Department"
            icon="business-outline"
            value={department}
            onChangeText={setDepartment}
            placeholder="Enter department"
          />

          <InputField
            label="Password *"
            icon="key-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          {/* Status Toggle */}
          <View style={styles.statusContainer}>
            <View style={styles.statusLabel}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.label}>Active Status</Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: '#ccc', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || uploading}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#999'] : [COLORS.primary, '#004A8D']}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  uploadHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 10,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    marginTop: 30,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EditEmployeeScreen;
