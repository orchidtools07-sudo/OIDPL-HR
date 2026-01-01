import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ref, query, orderByChild, equalTo, get, remove } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Clean up location history older than 10 days
 */
export const cleanupOldLocationHistory = async () => {
  try {
    const locationHistoryRef = ref(database, 'locationHistory');
    const snapshot = await get(locationHistoryRef);
    
    if (!snapshot.exists()) {
      return { success: true, message: 'No location history to clean' };
    }
    
    const allHistory = snapshot.val();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const cutoffTimestamp = tenDaysAgo.getTime();
    
    let deletedCount = 0;
    
    // Iterate through each employee's location history
    for (const employeeId in allHistory) {
      const employeeHistory = allHistory[employeeId];
      
      for (const recordId in employeeHistory) {
        const record = employeeHistory[recordId];
        const recordTimestamp = new Date(record.timestamp).getTime();
        
        if (recordTimestamp < cutoffTimestamp) {
          // Delete old record
          const recordRef = ref(database, `locationHistory/${employeeId}/${recordId}`);
          await remove(recordRef);
          deletedCount++;
        }
      }
    }
    
    return {
      success: true,
      message: `Cleaned up ${deletedCount} old location records`,
      deletedCount,
    };
  } catch (error) {
    console.error('Error cleaning up location history:', error);
    return {
      success: false,
      message: 'Failed to clean up location history',
    };
  }
};

/**
 * Fetch employee's location history for a specific date
 */
export const getEmployeeLocationHistory = async (employeeId, selectedDate = new Date()) => {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    const snapshot = await get(employeeRef);
    
    if (!snapshot.exists()) {
      return { success: false, message: 'Employee not found' };
    }
    
    const employeeData = snapshot.val();
    const locationHistoryRef = ref(database, `locationHistory/${employeeId}`);
    const locationSnapshot = await get(locationHistoryRef);
    
    let locationHistory = [];
    
    // Prepare target date
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const targetTimestamp = targetDate.getTime();
    
    if (locationSnapshot.exists()) {
      const history = locationSnapshot.val();
      
      // Filter locations for selected date
      Object.keys(history).forEach((key) => {
        const record = history[key];
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0);
        
        if (recordDate.getTime() === targetTimestamp) {
          locationHistory.push({
            time: new Date(record.timestamp).toLocaleTimeString(),
            datetime: new Date(record.timestamp).toLocaleString(),
            address: record.address || 'N/A',
            latitude: record.lat?.toFixed(6) || 'N/A',
            longitude: record.lon?.toFixed(6) || 'N/A',
          });
        }
      });
    }
    
    // Sort by time
    locationHistory.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    return {
      success: true,
      employee: {
        name: employeeData.name,
        code: employeeData.code,
        mobile: employeeData.mobile,
        designation: employeeData.designation || 'N/A',
        department: employeeData.department || 'N/A',
      },
      locationHistory,
      reportDate: targetDate.toLocaleDateString(),
    };
  } catch (error) {
    console.error('Error fetching location history:', error);
    return { success: false, message: 'Failed to fetch location history' };
  }
};

/**
 * Generate and download Excel report
 */
export const generateEmployeeLocationReport = async (employee, selectedDate = new Date()) => {
  try {
    // Fetch location history
    const result = await getEmployeeLocationHistory(employee.id, selectedDate);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const { employee: empData, locationHistory, reportDate } = result;
    
    // Prepare data for Excel
    const reportData = [
      ['OIDPL HR - Employee Location Report'],
      [''],
      ['Employee Name:', empData.name],
      ['Employee Code:', empData.code],
      ['Mobile Number:', empData.mobile],
      ['Designation:', empData.designation],
      ['Department:', empData.department],
      ['Report Date:', reportDate],
      ['Generated On:', new Date().toLocaleString()],
      [''],
      ['Time', 'Date & Time', 'Location Address', 'Latitude', 'Longitude'],
    ];
    
    // Add location history
    if (locationHistory.length > 0) {
      locationHistory.forEach((location) => {
        reportData.push([
          location.time,
          location.datetime,
          location.address,
          location.latitude,
          location.longitude,
        ]);
      });
    } else {
      reportData.push(['No location data available for this date']);
    }
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // Time
      { wch: 20 },  // Date & Time
      { wch: 40 },  // Location Address
      { wch: 12 },  // Latitude
      { wch: 12 },  // Longitude
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Location Report');
    
    // Generate Excel file
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    
    // Create file name
    const dateStr = new Date(selectedDate).toISOString().split('T')[0];
    const fileName = `${empData.name.replace(/\s+/g, '_')}_Location_Report_${dateStr}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    // Write file
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: 'base64',
    });
    
    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Download Employee Location Report',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
    
    return { success: true, message: 'Report downloaded successfully' };
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, message: error.message || 'Failed to generate report' };
  }
};

/**
 * Generate multi-employee location report for date range
 */
export const generateMultiEmployeeLocationReport = async (employees, fromDate, toDate) => {
  try {
    console.log(`Generating multi-employee report for ${employees.length} employees from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`);
    
    // Prepare report data
    const reportData = [
      ['OIDPL HR - Multiple Employees Location Report'],
      [''],
      ['Report Date Range:', `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`],
      ['Total Employees:', employees.length],
      ['Generated On:', new Date().toLocaleString()],
      [''],
    ];
    
    // Process each employee
    for (const employee of employees) {
      // Add employee header
      reportData.push(['']);
      reportData.push([`EMPLOYEE: ${employee.name} (${employee.code})`]);
      reportData.push(['Mobile:', employee.mobile || 'N/A']);
      reportData.push(['Designation:', employee.designation || 'N/A']);
      reportData.push(['Department:', employee.department || 'N/A']);
      reportData.push(['']);
      reportData.push(['Date', 'Time', 'Date & Time', 'Location Address', 'Latitude', 'Longitude']);
      
      // Fetch location history for this employee
      const locationHistoryRef = ref(database, `locationHistory/${employee.id}`);
      const locationSnapshot = await get(locationHistoryRef);
      
      let employeeLocations = [];
      
      if (locationSnapshot.exists()) {
        const history = locationSnapshot.val();
        
        // Filter locations for date range
        Object.keys(history).forEach((key) => {
          const record = history[key];
          const recordDate = new Date(record.timestamp);
          
          // Check if date is within range
          if (recordDate >= fromDate && recordDate <= toDate) {
            employeeLocations.push({
              date: recordDate.toLocaleDateString(),
              time: recordDate.toLocaleTimeString(),
              datetime: recordDate.toLocaleString(),
              address: record.address || 'N/A',
              latitude: record.lat?.toFixed(6) || 'N/A',
              longitude: record.lon?.toFixed(6) || 'N/A',
              timestamp: recordDate.getTime(),
            });
          }
        });
      }
      
      // Sort by timestamp
      employeeLocations.sort((a, b) => a.timestamp - b.timestamp);
      
      // Add location data
      if (employeeLocations.length > 0) {
        employeeLocations.forEach((location) => {
          reportData.push([
            location.date,
            location.time,
            location.datetime,
            location.address,
            location.latitude,
            location.longitude,
          ]);
        });
      } else {
        reportData.push(['No location data available for this date range']);
      }
      
      reportData.push(['']); // Empty row between employees
    }
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },  // Date
      { wch: 12 },  // Time
      { wch: 20 },  // Date & Time
      { wch: 40 },  // Location Address
      { wch: 12 },  // Latitude
      { wch: 12 },  // Longitude
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Multi Employee Report');
    
    // Generate Excel file
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    
    // Create file name
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];
    const fileName = `Multi_Employee_Report_${fromDateStr}_to_${toDateStr}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    // Write file
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: 'base64',
    });
    
    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Download Multi-Employee Location Report',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
    
    return { success: true, message: 'Multi-employee report downloaded successfully' };
  } catch (error) {
    console.error('Error generating multi-employee report:', error);
    return { success: false, message: error.message || 'Failed to generate multi-employee report' };
  }
};
