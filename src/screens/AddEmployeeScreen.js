import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { addEmployee, importEmployeesFromCSV } from '../utils/auth';

const AddEmployeeScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    mobile: '',
    designation: '',
    department: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const { name, code, mobile, designation, department, password } = formData;

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter employee name');
      return false;
    }
    if (!code.trim()) {
      Alert.alert('Validation Error', 'Please enter employee code');
      return false;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Validation Error', 'Please enter valid 10-digit mobile number');
      return false;
    }
    if (!designation.trim()) {
      Alert.alert('Validation Error', 'Please enter designation');
      return false;
    }
    if (!department.trim()) {
      Alert.alert('Validation Error', 'Please enter department');
      return false;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await addEmployee(formData);
      
      setLoading(false);
      
      if (result.success) {
        Alert.alert(
          'Success',
          `Employee ${formData.name} has been added successfully!`,
          [
            {
              text: 'Add Another',
              onPress: () => {
                setFormData({
                  name: '',
                  code: '',
                  mobile: '',
                  designation: '',
                  department: '',
                  password: '',
                });
              },
            },
            {
              text: 'View All',
              onPress: () => navigation.navigate('EmployeeTracking'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to add employee. Please try again.');
    }
  };

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        setCsvFile(file);
        Alert.alert('File Selected', `${file.name} selected successfully`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick CSV file');
      console.error(error);
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile) {
      Alert.alert('No File', 'Please select a CSV file first');
      return;
    }

    setLoading(true);

    try {
      // Parse CSV file (simplified - in production use proper CSV parser)
      // This is a placeholder - you'd need to read and parse the actual file
      // For now, we'll show success message
      Alert.alert(
        'Upload CSV',
        'CSV upload feature requires file reading. Please add employees manually for now.',
        [{ text: 'OK' }]
      );
      
      setLoading(false);
      setCsvFile(null);
      
      // In production, you would:
      // 1. Read the file content
      // 2. Parse CSV data
      // 3. Call importEmployeesFromCSV(parsedData)
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to upload CSV');
    }
  };

  const downloadCSVTemplate = () => {
    Alert.alert(
      'CSV Template Format',
      'Create a CSV file with these columns:\n\nname,code,mobile,designation,department,password\n\nExample:\nJohn Doe,EMP001,9876543210,Manager,HR,password123',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Manual Entry Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-add" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Add Employee Manually</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., EMP001"
                value={formData.code}
                onChangeText={(text) => handleInputChange('code', text)}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChangeText={(text) => handleInputChange('mobile', text)}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Designation *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Software Engineer"
                value={formData.designation}
                onChangeText={(text) => handleInputChange('designation', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., IT, HR, Sales"
                value={formData.department}
                onChangeText={(text) => handleInputChange('department', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleAddEmployee}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Add Employee</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* CSV Upload Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Upload via CSV</Text>
          </View>

          <View style={styles.csvSection}>
            <TouchableOpacity style={styles.templateButton} onPress={downloadCSVTemplate}>
              <Ionicons name="download" size={18} color={COLORS.primary} />
              <Text style={styles.templateButtonText}>View CSV Template Format</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickButton} onPress={handlePickCSV}>
              <Ionicons name="document" size={20} color={COLORS.white} />
              <Text style={styles.pickButtonText}>
                {csvFile ? csvFile.name : 'Choose CSV File'}
              </Text>
            </TouchableOpacity>

            {csvFile && (
              <View style={styles.fileInfo}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.fileName}>{csvFile.name}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.uploadButton,
                (!csvFile || loading) && styles.disabledButton,
              ]}
              onPress={handleUploadCSV}
              disabled={!csvFile || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color={COLORS.white} />
                  <Text style={styles.uploadButtonText}>Upload CSV</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Instructions</Text>
          <Text style={styles.instructionsText}>
            • All fields marked with * are mandatory{'\n'}
            • Mobile number must be 10 digits{'\n'}
            • Password must be at least 6 characters{'\n'}
            • Employee code must be unique{'\n'}
            • CSV file must follow the template format
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    fontSize: FONTS.sizes.medium,
    backgroundColor: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
  },
  csvSection: {
    gap: SPACING.md,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SPACING.xs,
  },
  templateButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
  },
  pickButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.xs,
  },
  pickButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.lightSuccess,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.xs,
  },
  fileName: {
    color: COLORS.success,
    fontSize: FONTS.sizes.medium,
    fontWeight: '600',
    flex: 1,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.xs,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});

export default AddEmployeeScreen;
