import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { updateEmployeeProfile, uploadProfilePicture } from '../utils/auth';

const EditProfileScreen = ({ route, navigation }) => {
  const userData = route?.params?.userData;
  const [name, setName] = useState(userData?.name || '');
  const [mobile, setMobile] = useState(userData?.mobile || '');
  const [profileImage, setProfileImage] = useState(userData?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress to reduce size
    });

    if (!result.canceled) {
      setUploading(true);
      
      // Upload to Firebase Storage
      const imageUri = result.assets[0].uri;
      const uploadResult = await uploadProfilePicture(userData.id, imageUri);
      
      setUploading(false);
      
      if (uploadResult.success) {
        setProfileImage(uploadResult.imageUrl);
        Alert.alert('Success', 'Profile picture uploaded successfully');
      } else {
        Alert.alert('Error', uploadResult.message || 'Failed to upload image');
      }
    }
  };

  const handleSave = async () => {
    // Only update profile picture, no other fields
    if (!profileImage) {
      Alert.alert('No Changes', 'Please upload a profile picture to save');
      return;
    }

    Alert.alert('Success', 'Profile picture updated successfully', [
      {
        text: 'OK',
        onPress: () => {
          // Go back to dashboard and it will refresh
          navigation.goBack();
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageSection}>
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
                  {userData?.name?.charAt(0) || 'E'}
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

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={name}
                editable={false}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.hint}>Name cannot be changed. Contact HR to update.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={mobile}
                placeholder="Enter mobile number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={false}
              />
            </View>
            <Text style={styles.hint}>Mobile number cannot be changed (used for login)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employee Code</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="id-card-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={userData?.code || 'N/A'}
                editable={false}
              />
            </View>
            <Text style={styles.hint}>Employee code is assigned by HR</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (loading || !profileImage || profileImage === userData?.profileImage) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || uploading || !profileImage || profileImage === userData?.profileImage}
        >
          <LinearGradient
            colors={(loading || !profileImage || profileImage === userData?.profileImage) ? ['#ccc', '#999'] : [COLORS.primary, '#004A8D']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>
                  {profileImage && profileImage !== userData?.profileImage ? 'Save Profile Picture' : 'No Changes'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Note: Only profile picture can be updated. To change name or mobile number, please contact HR department.
        </Text>
      </ScrollView>
    </View>
  );
};

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
  profileImageSection: {
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
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
  disabledText: {
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
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
  noteText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EditProfileScreen;
