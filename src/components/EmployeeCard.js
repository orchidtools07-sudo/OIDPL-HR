import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { generateEmployeeLocationReport } from '../utils/reportGenerator';

const EmployeeCard = ({ employee, onViewMap, onViewDetails, showMapButton = true, disableActions = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'ios') {
        // For iOS, download immediately after selection
        handleDownloadReport(date);
      } else {
        // For Android, show confirmation
        handleDownloadReport(date);
      }
    }
  };
  
  const handleDownloadReport = async (date = selectedDate) => {
    setDownloading(true);
    setShowDatePicker(false);
    
    try {
      const result = await generateEmployeeLocationReport(employee, date);
      if (result.success) {
        Alert.alert('Success', 'Location report downloaded successfully');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };
  
  const openDatePicker = () => {
    // Set max date to 10 days ago (since older data is deleted)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    setShowDatePicker(true);
  };
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onViewDetails && onViewDetails(employee)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {employee?.profileImage ? (
            <Image 
              source={{ uri: employee.profileImage }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={COLORS.white} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.code}>{employee.code}</Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsIcon}
          onPress={() => onViewDetails && onViewDetails(employee)}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{employee.mobile}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{employee.designation || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={employee.location?.address ? COLORS.secondary : COLORS.lightGray} />
          <Text style={[styles.detailText, !employee.location?.address && styles.noLocation]}>
            {employee.location?.address || 'Location not shared'}
          </Text>
        </View>
        {employee.location?.timestamp && (
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={COLORS.darkGray} />
            <Text style={styles.timestampText}>
              Updated: {new Date(employee.location.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {showMapButton && !disableActions && (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.mapButton, styles.downloadButton]}
              onPress={openDatePicker}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="calendar" size={16} color={COLORS.white} />
                  <Text style={styles.mapButtonText}>Download Report</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => onViewMap(employee)}
            >
              <Ionicons name="map" size={16} color={COLORS.white} />
              <Text style={styles.mapButtonText}>View Map</Text>
            </TouchableOpacity>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={(() => {
                const tenDaysAgo = new Date();
                tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
                return tenDaysAgo;
              })()}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailsIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  code: {
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
  },
  details: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    flex: 1,
  },
  noLocation: {
    color: COLORS.lightGray,
    fontStyle: 'italic',
  },
  timestampText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.small,
    color: COLORS.darkGray,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mapButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
  },
  downloadButton: {
    backgroundColor: COLORS.secondary,
  },
  mapButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});

export default EmployeeCard;
