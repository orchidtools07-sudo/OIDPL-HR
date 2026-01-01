import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EmployeeHolidaysScreen = () => {
  // Holidays data (same as uploaded by admin)
  const [holidays] = useState([
    { id: 1, name: 'Republic Day', date: new Date('2026-01-26'), type: 'National Holiday' },
    { id: 2, name: 'Holika (Dahan)', date: new Date('2026-03-03'), type: 'Festival' },
    { id: 3, name: 'Holi', date: new Date('2026-03-04'), type: 'Festival' },
    { id: 4, name: 'Ram Navami', date: new Date('2026-03-26'), type: 'Festival' },
    { id: 5, name: 'Independence Day', date: new Date('2026-08-15'), type: 'National Holiday' },
    { id: 6, name: 'Raksha Bandhan', date: new Date('2026-08-28'), type: 'Festival' },
    { id: 7, name: 'Janmashtami', date: new Date('2026-09-04'), type: 'Festival' },
    { id: 8, name: "Gandhi's Birthday", date: new Date('2026-10-02'), type: 'National Holiday' },
    { id: 9, name: 'Dussehra', date: new Date('2026-10-20'), type: 'Festival' },
    { id: 10, name: 'Goverdhan Pooja', date: new Date('2026-11-09'), type: 'Festival' },
    { id: 11, name: "New Year's Eve", date: new Date('2026-12-31'), type: 'Festival' },
  ]);

  const handleDownloadList = () => {
    Alert.alert(
      'Download Holiday List',
      'Download the complete holiday calendar for 2026?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // In real app, this would download the PDF
            Alert.alert('Success', 'Holiday list downloaded successfully');
          },
        },
      ]
    );
  };

  // Calculate upcoming holidays
  const today = new Date();
  const upcomingHolidays = holidays.filter(holiday => holiday.date > today).length;
  const nextHoliday = holidays.find(holiday => holiday.date > today);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#004A8D']}
        style={styles.header}
      >
        <Ionicons name="today" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>Holiday Calendar 2026</Text>
        <Text style={styles.headerSubtitle}>Company holidays for 2026</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#006dc0', '#0088ff']}
              style={styles.statIconContainer}
            >
              <Ionicons name="calendar" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{holidays.length}</Text>
            <Text style={styles.statLabel}>Total Holidays</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#10b981', '#34d399']}
              style={styles.statIconContainer}
            >
              <Ionicons name="time" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{upcomingHolidays}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Next Holiday Card */}
        {nextHoliday && (
          <View style={styles.nextHolidayCard}>
            <LinearGradient
              colors={['#f59e0b', '#fbbf24']}
              style={styles.nextHolidayGradient}
            >
              <Ionicons name="star" size={32} color={COLORS.white} />
              <Text style={styles.nextHolidayLabel}>Next Holiday</Text>
              <Text style={styles.nextHolidayName}>{nextHoliday.name}</Text>
              <Text style={styles.nextHolidayDate}>
                {nextHoliday.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadList}
        >
          <LinearGradient
            colors={[COLORS.primary, '#004A8D']}
            style={styles.downloadButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cloud-download" size={24} color={COLORS.white} />
            <Text style={styles.downloadButtonText}>Download Holiday List</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Holidays List */}
        <View style={styles.holidaysContainer}>
          <Text style={styles.sectionTitle}>All Holidays ({holidays.length})</Text>

          {holidays.map(holiday => {
            const isPast = holiday.date < today;
            const dayName = holiday.date.toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <View 
                key={holiday.id} 
                style={[styles.holidayCard, isPast && styles.pastHolidayCard]}
              >
                <View style={styles.holidayIconContainer}>
                  <LinearGradient
                    colors={
                      holiday.type === 'National Holiday'
                        ? ['#006dc0', '#0088ff']
                        : ['#f59e0b', '#fbbf24']
                    }
                    style={styles.holidayIcon}
                  >
                    <Ionicons
                      name={holiday.type === 'National Holiday' ? 'flag' : 'sunny'}
                      size={24}
                      color={COLORS.white}
                    />
                  </LinearGradient>
                </View>

                <View style={styles.holidayInfo}>
                  <Text style={[styles.holidayName, isPast && styles.pastHolidayText]}>
                    {holiday.name}
                  </Text>
                  <View style={styles.holidayDetails}>
                    <View style={styles.holidayDetailItem}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.holidayDetailText}>
                        {holiday.date.toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.holidayDetailItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.holidayDetailText}>{dayName}</Text>
                    </View>
                  </View>
                </View>

                <View style={[
                  styles.typeBadge,
                  { backgroundColor: holiday.type === 'National Holiday' ? '#dbeafe' : '#fef3c7' }
                ]}>
                  <Text style={[
                    styles.typeBadgeText,
                    { color: holiday.type === 'National Holiday' ? '#006dc0' : '#f59e0b' }
                  ]}>
                    {holiday.type === 'National Holiday' ? 'National' : 'Festival'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployeeHolidaysScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl + 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  nextHolidayCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  nextHolidayGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  nextHolidayLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.sm,
  },
  nextHolidayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  nextHolidayDate: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.95,
  },
  downloadButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  holidaysContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  pastHolidayCard: {
    opacity: 0.6,
  },
  holidayIconContainer: {
    marginRight: SPACING.md,
  },
  holidayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  pastHolidayText: {
    color: '#999',
  },
  holidayDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  holidayDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayDetailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
