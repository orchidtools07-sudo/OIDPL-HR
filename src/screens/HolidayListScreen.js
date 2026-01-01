import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HolidayListScreen = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Republic Day', date: new Date('2026-01-26'), type: 'National Holiday' },
    { id: 2, name: 'Holika (Dahan)', date: new Date('2026-03-03'), type: 'Festival' },
    { id: 3, name: 'Holi', date: new Date('2026-03-04'), type: 'Festival' },
    { id: 4, name: 'Ram Navami', date: new Date('2026-03-26'), type: 'Festival' },
    { id: 5, name: 'Independence Day', date: new Date('2026-08-15'), type: 'National Holiday' },
    { id: 6, name: 'Raksha Bandhan', date: new Date('2026-08-28'), type: 'Festival' },
    { id: 7, name: 'Janmashtami', date: new Date('2026-09-04'), type: 'Festival' },
    { id: 8, name: "Mahatama Gandhi's Birthday", date: new Date('2026-10-02'), type: 'National Holiday' },
    { id: 9, name: 'Dussehra', date: new Date('2026-10-20'), type: 'Festival' },
    { id: 10, name: 'Goverdhan Pooja', date: new Date('2026-11-09'), type: 'Festival' },
    { id: 11, name: "New Year's Eve", date: new Date('2026-12-31'), type: 'Festival' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: new Date(), type: 'National Holiday' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);

  const handleUploadPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || result.assets) {
        const file = result.assets ? result.assets[0] : result;
        setUploadedPdf(file);
        
        // Simulate PDF parsing and extract holidays
        const extractedHolidays = [
          { id: Date.now() + 1, name: 'Eid ul-Fitr', date: new Date('2026-03-24'), type: 'Festival' },
          { id: Date.now() + 2, name: 'Buddha Purnima', date: new Date('2026-05-01'), type: 'Festival' },
          { id: Date.now() + 3, name: 'Eid ul-Adha', date: new Date('2026-06-01'), type: 'Festival' },
          { id: Date.now() + 4, name: 'Muharram', date: new Date('2026-06-20'), type: 'Festival' },
          { id: Date.now() + 5, name: 'Diwali', date: new Date('2026-10-29'), type: 'Festival' },
          { id: Date.now() + 6, name: 'Guru Nanak Jayanti', date: new Date('2026-11-20'), type: 'Festival' },
          { id: Date.now() + 7, name: 'Christmas', date: new Date('2026-12-25'), type: 'National Holiday' },
        ];
        
        // Merge with existing holidays and sort by date
        const mergedHolidays = [...holidays];
        extractedHolidays.forEach(newHoliday => {
          // Check if holiday already exists
          const exists = mergedHolidays.some(h => 
            h.name.toLowerCase() === newHoliday.name.toLowerCase() ||
            h.date.toDateString() === newHoliday.date.toDateString()
          );
          if (!exists) {
            mergedHolidays.push(newHoliday);
          }
        });
        
        setHolidays(mergedHolidays.sort((a, b) => a.date - b.date));
        
        Alert.alert(
          'PDF Processed Successfully!',
          `File: ${file.name}\n\n${extractedHolidays.length} holidays extracted and added to the list.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload PDF. Please try again.');
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.name.trim()) {
      Alert.alert('Error', 'Please enter holiday name');
      return;
    }

    const holiday = {
      id: Date.now(),
      name: newHoliday.name,
      date: newHoliday.date,
      type: newHoliday.type,
    };

    setHolidays([...holidays, holiday].sort((a, b) => a.date - b.date));
    setModalVisible(false);
    setNewHoliday({ name: '', date: new Date(), type: 'National Holiday' });
    Alert.alert('Success', 'Holiday added successfully!');
  };

  const handleDeleteHoliday = (id) => {
    Alert.alert(
      'Delete Holiday',
      'Are you sure you want to delete this holiday?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setHolidays(holidays.filter(h => h.id !== id)),
        },
      ]
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'long' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, '#004A8D']} style={styles.header}>
          <Ionicons name="sunny" size={48} color={COLORS.white} />
          <Text style={styles.headerTitle}>Holiday Calendar 2026</Text>
          <Text style={styles.headerSubtitle}>Manage company holidays for 2026</Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUploadPDF}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.actionGradient}>
              <Ionicons name="cloud-upload-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Upload PDF</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
            <LinearGradient colors={[COLORS.primary, '#004A8D']} style={styles.actionGradient}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Add Holiday</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Uploaded PDF Info */}
        {uploadedPdf && (
          <View style={styles.pdfCard}>
            <Ionicons name="document-text" size={32} color={COLORS.primary} />
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfTitle}>Uploaded Document</Text>
              <Text style={styles.pdfName}>{uploadedPdf.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setUploadedPdf(null)}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}

        {/* Holiday Count */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{holidays.length}</Text>
            <Text style={styles.statLabel}>Total Holidays</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{holidays.filter(h => h.date > new Date()).length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Holiday List */}
        <Text style={styles.sectionTitle}>All Holidays</Text>
        {holidays.map((holiday) => (
          <View key={holiday.id} style={styles.holidayCard}>
            <View style={styles.holidayLeft}>
              <LinearGradient
                colors={holiday.type === 'Festival' ? ['#FF9800', '#F57C00'] : ['#667eea', '#764ba2']}
                style={styles.holidayIcon}
              >
                <Ionicons
                  name={holiday.type === 'Festival' ? 'star' : 'flag'}
                  size={24}
                  color={COLORS.white}
                />
              </LinearGradient>
              <View style={styles.holidayInfo}>
                <Text style={styles.holidayName}>{holiday.name}</Text>
                <Text style={styles.holidayDate}>{formatDate(holiday.date)}</Text>
                <View style={styles.holidayMeta}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.darkGray} />
                  <Text style={styles.holidayDay}>{getDayOfWeek(holiday.date)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.holidayRight}>
              <View style={[styles.badge, holiday.type === 'Festival' && styles.badgeFestival]}>
                <Text style={styles.badgeText}>{holiday.type}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteHoliday(holiday.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Holiday Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Holiday</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Holiday Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., New Year's Day"
                value={newHoliday.name}
                onChangeText={(text) => setNewHoliday({ ...newHoliday, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateText}>{formatDate(newHoliday.date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newHoliday.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewHoliday({ ...newHoliday, date: selectedDate });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newHoliday.type === 'National Holiday' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewHoliday({ ...newHoliday, type: 'National Holiday' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newHoliday.type === 'National Holiday' && styles.typeButtonTextActive,
                    ]}
                  >
                    National Holiday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newHoliday.type === 'Festival' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewHoliday({ ...newHoliday, type: 'Festival' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newHoliday.type === 'Festival' && styles.typeButtonTextActive,
                    ]}
                  >
                    Festival
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddHoliday}>
              <LinearGradient colors={[COLORS.primary, '#004A8D']} style={styles.saveGradient}>
                <Text style={styles.saveButtonText}>Add Holiday</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: SPACING.xs,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  pdfInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  pdfTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  pdfName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  holidayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holidayIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  holidayDate: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  holidayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  holidayDay: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  holidayRight: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFestival: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  saveGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HolidayListScreen;
