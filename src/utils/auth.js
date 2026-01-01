import { ref, get, set, push, update, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';
import { database } from '../config/firebase';

// Admin credentials (hardcoded for admin access)
const ADMIN_CREDENTIALS = {
  email: 'admin@oidpl.com',
  password: '123456',
};

/**
 * Login function - supports both admin (email) and employee (mobile number)
 */
export const loginUser = async (identifier, password) => {
  try {
    // Check if admin login (email format)
    if (identifier.includes('@')) {
      if (identifier === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        return {
          success: true,
          role: 'admin',
          message: 'Admin login successful',
        };
      } else {
        return {
          success: false,
          message: 'Invalid admin credentials',
        };
      }
    } 
    // Employee login with mobile number
    else {
      const employeesRef = ref(database, 'employees');
      const employeeQuery = query(employeesRef, orderByChild('mobile'), equalTo(identifier));
      
      const snapshot = await get(employeeQuery);
      
      if (snapshot.exists()) {
        const employees = snapshot.val();
        const employeeId = Object.keys(employees)[0];
        const employee = employees[employeeId];
        
        // Check password
        if (employee.password === password) {
          return {
            success: true,
            role: 'employee',
            user: {
              id: employeeId,
              ...employee,
            },
            message: 'Employee login successful',
          };
        } else {
          return {
            success: false,
            message: 'Invalid password',
          };
        }
      } else {
        return {
          success: false,
          message: 'Employee not found. Please check your mobile number.',
        };
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login. Please try again.',
    };
  }
};

/**
 * Add new employee to Firebase
 */
export const addEmployee = async (employeeData) => {
  try {
    const employeesRef = ref(database, 'employees');
    // Helper: try an indexed query, fallback to client-side scan if index missing
    const existsByField = async (field, value) => {
      try {
        const q = query(employeesRef, orderByChild(field), equalTo(value));
        const snap = await get(q);
        return snap.exists();
      } catch (err) {
        // Detect Firebase index error message and fallback to safe client-side check
        const msg = (err && err.message) ? err.message.toLowerCase() : '';
        if (msg.includes('index') || msg.includes('.indexon') || msg.includes('index not defined')) {
          const allSnap = await get(employeesRef);
          if (!allSnap.exists()) return false;
          const all = allSnap.val();
          return Object.values(all).some(e => e && e[field] === value);
        }
        // rethrow unexpected errors
        throw err;
      }
    };

    // Check if employee code already exists
    const codeExists = await existsByField('code', employeeData.code);
    if (codeExists) {
      return {
        success: false,
        message: 'Employee code already exists',
      };
    }

    // Check if mobile number already exists
    const mobileExists = await existsByField('mobile', employeeData.mobile);
    if (mobileExists) {
      return {
        success: false,
        message: 'Mobile number already exists',
      };
    }
    
    // Add employee with timestamp
    const newEmployeeRef = push(employeesRef);
    await set(newEmployeeRef, {
      ...employeeData,
      createdAt: new Date().toISOString(),
      active: true,
    });
    
    return {
      success: true,
      message: 'Employee added successfully',
      employeeId: newEmployeeRef.key,
    };
  } catch (error) {
    console.error('Add employee error:', error);
    return {
      success: false,
      message: 'Failed to add employee. Please try again.',
    };
  }
};

/**
 * Get all employees from Firebase (optimized with limit)
 */
export const getAllEmployees = async (limit = 100) => {
  try {
    const employeesRef = ref(database, 'employees');
    // Limit query to prevent loading too much data at once
    const employeesQuery = query(employeesRef, limitToFirst(limit));
    const snapshot = await get(employeesQuery);
    
    if (snapshot.exists()) {
      const employeesData = snapshot.val();
      const employees = Object.keys(employeesData).map(key => ({
        id: key,
        ...employeesData[key],
      }));
      
      return {
        success: true,
        employees,
      };
    } else {
      return {
        success: true,
        employees: [],
      };
    }
  } catch (error) {
    console.error('Get employees error:', error);
    return {
      success: false,
      employees: [],
      message: 'Failed to fetch employees',
    };
  }
};

/**
 * Update employee location
 */
export const updateEmployeeLocation = async (employeeId, location, employeeData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Update current location in employee node
    const employeeRef = ref(database, `employees/${employeeId}/location`);
    await set(employeeRef, {
      ...location,
      timestamp: timestamp,
      lastUpdated: timestamp,
    });
    
    // Save to location history for reports with employee details
    const historyRef = ref(database, `locationHistory/${employeeId}`);
    const newHistoryRef = push(historyRef);
    await set(newHistoryRef, {
      ...location,
      timestamp: timestamp,
      employeeName: employeeData.name || 'Unknown',
      employeeCode: employeeData.code || 'N/A',
      employeeMobile: employeeData.mobile || 'N/A',
    });
    
    return {
      success: true,
      message: 'Location updated successfully',
    };
  } catch (error) {
    console.error('Update location error:', error);
    return {
      success: false,
      message: 'Failed to update location',
    };
  }
};

/**
 * Batch import employees from CSV
 */
export const importEmployeesFromCSV = async (employeesArray) => {
  try {
    const employeesRef = ref(database, 'employees');
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    for (const employee of employeesArray) {
      try {
        // Check if code exists
        const codeQuery = query(employeesRef, orderByChild('code'), equalTo(employee.code));
        const codeSnapshot = await get(codeQuery);
        
        if (codeSnapshot.exists()) {
          failCount++;
          errors.push(`${employee.code} - Code already exists`);
          continue;
        }
        
        // Add employee
        const newEmployeeRef = push(employeesRef);
        await set(newEmployeeRef, {
          ...employee,
          createdAt: new Date().toISOString(),
          active: true,
        });
        
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${employee.code} - ${error.message}`);
      }
    }
    
    return {
      success: true,
      successCount,
      failCount,
      errors,
      message: `Imported ${successCount} employees successfully. ${failCount} failed.`,
    };
  } catch (error) {
    console.error('Import employees error:', error);
    return {
      success: false,
      message: 'Failed to import employees',
    };
  }
};

/**
 * Delete employee from Firebase
 */
export const deleteEmployee = async (employeeId) => {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    await set(employeeRef, null); // Delete the employee node
    
    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  } catch (error) {
    console.error('Delete employee error:', error);
    return {
      success: false,
      message: 'Failed to delete employee',
    };
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (employeeId) => {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    const snapshot = await get(employeeRef);
    
    if (snapshot.exists()) {
      return {
        success: true,
        employee: {
          id: employeeId,
          ...snapshot.val(),
        },
      };
    } else {
      return {
        success: false,
        message: 'Employee not found',
      };
    }
  } catch (error) {
    console.error('Get employee error:', error);
    return {
      success: false,
      message: 'Failed to fetch employee data',
    };
  }
};

/**
 * Update employee password
 */
export const updateEmployeePassword = async (employeeId, newPassword) => {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    await update(employeeRef, { password: newPassword });
    
    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: 'Failed to update password',
    };
  }
};

/**
 * Update employee profile (name, mobile, profileImage)
 */
export const updateEmployeeProfile = async (employeeId, profileData) => {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    await update(employeeRef, {
      ...profileData,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: 'Failed to update profile',
    };
  }
};

/**
 * Upload profile picture to Firebase Storage
 * Simplified version: converts to base64 and stores in database
 */
export const uploadProfilePicture = async (employeeId, imageUri) => {
  try {
    // Read image as base64
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
    
    // Compress and resize image
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 400 } }], // Resize to 400px width
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    
    // Convert to base64
    const response = await fetch(manipResult.uri);
    const blob = await response.blob();
    const reader = new FileReader();
    
    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    const base64Image = await base64Promise;
    
    // Update employee record with base64 image
    const employeeRef = ref(database, `employees/${employeeId}`);
    await update(employeeRef, {
      profileImage: base64Image,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      imageUrl: base64Image,
      message: 'Profile picture uploaded successfully',
    };
  } catch (error) {
    console.error('Upload profile picture error:', error);
    return {
      success: false,
      message: 'Failed to upload profile picture',
    };
  }
};

// ==================== LEAVE MANAGEMENT ====================

/**
 * Apply for leave (Employee)
 */
export const applyLeave = async (employeeId, leaveData) => {
  try {
    const leavesRef = ref(database, 'leaves');
    const newLeaveRef = push(leavesRef);
    const leaveId = newLeaveRef.key;
    
    await set(newLeaveRef, {
      ...leaveData,
      employeeId,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    // Create notifications for selected managers
    const notificationsRef = ref(database, 'notifications');
    if (leaveData.managers && leaveData.managers.length > 0) {
      for (const manager of leaveData.managers) {
        const managerNotifRef = push(notificationsRef);
        await set(managerNotifRef, {
          recipientId: manager.id,
          recipientName: manager.name,
          type: 'leave_request',
          leaveId: leaveId,
          employeeId: employeeId,
          employeeName: leaveData.employeeName,
          employeeCode: leaveData.employeeCode,
          leaveType: leaveData.leaveType,
          fromDate: leaveData.fromDate,
          toDate: leaveData.toDate,
          days: leaveData.days,
          reason: leaveData.reason,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    }
    
    // Create notification for HR (admin)
    const hrNotifRef = push(notificationsRef);
    await set(hrNotifRef, {
      recipientId: 'admin',
      recipientName: 'HR Department',
      type: 'leave_request',
      leaveId: leaveId,
      employeeId: employeeId,
      employeeName: leaveData.employeeName,
      employeeCode: leaveData.employeeCode,
      leaveType: leaveData.leaveType,
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      days: leaveData.days,
      reason: leaveData.reason,
      managers: leaveData.managers,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      read: false,
    });
    
    return {
      success: true,
      leaveId: leaveId,
      message: 'Leave application submitted successfully',
    };
  } catch (error) {
    console.error('Apply leave error:', error);
    return {
      success: false,
      message: 'Failed to apply for leave',
    };
  }
};

/**
 * Get all leave requests (Admin)
 */
export const getAllLeaveRequests = async () => {
  try {
    const leavesRef = ref(database, 'leaves');
    const snapshot = await get(leavesRef);
    
    if (snapshot.exists()) {
      const leavesData = snapshot.val();
      const leaves = Object.keys(leavesData).map(key => ({
        id: key,
        ...leavesData[key],
        fromDate: new Date(leavesData[key].fromDate),
        toDate: new Date(leavesData[key].toDate),
        appliedDate: new Date(leavesData[key].appliedDate),
      }));
      
      return {
        success: true,
        leaves,
      };
    } else {
      return {
        success: true,
        leaves: [],
      };
    }
  } catch (error) {
    console.error('Get leave requests error:', error);
    return {
      success: false,
      leaves: [],
      message: 'Failed to fetch leave requests',
    };
  }
};

/**
 * Get employee leave requests
 */
export const getEmployeeLeaves = async (employeeId) => {
  try {
    const leavesRef = ref(database, 'leaves');
    const employeeLeavesQuery = query(leavesRef, orderByChild('employeeId'), equalTo(employeeId));
    const snapshot = await get(employeeLeavesQuery);
    
    if (snapshot.exists()) {
      const leavesData = snapshot.val();
      const leaves = Object.keys(leavesData).map(key => ({
        id: key,
        ...leavesData[key],
        fromDate: new Date(leavesData[key].fromDate),
        toDate: new Date(leavesData[key].toDate),
        appliedDate: new Date(leavesData[key].appliedDate),
      }));
      
      return {
        success: true,
        leaves,
      };
    } else {
      return {
        success: true,
        leaves: [],
      };
    }
  } catch (error) {
    console.error('Get employee leaves error:', error);
    return {
      success: false,
      leaves: [],
      message: 'Failed to fetch leaves',
    };
  }
};

/**
 * Update leave status (Admin)
 */
export const updateLeaveStatus = async (leaveId, status, remarks = '') => {
  try {
    const leaveRef = ref(database, `leaves/${leaveId}`);
    await update(leaveRef, {
      status,
      remarks,
      updatedAt: new Date().toISOString(),
      [status === 'Approved' ? 'approvedDate' : 'rejectedDate']: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error('Update leave status error:', error);
    return {
      success: false,
      message: 'Failed to update leave status',
    };
  }
};

/**
 * Get or initialize employee leave balance
 */
export const getEmployeeLeaveBalance = async (employeeId) => {
  try {
    const balanceRef = ref(database, `leaveBalances/${employeeId}`);
    const snapshot = await get(balanceRef);
    
    if (snapshot.exists()) {
      return {
        success: true,
        balance: snapshot.val(),
      };
    } else {
      // Initialize default balance based on policy
      const defaultBalance = {
        casualSick: { total: 12, used: 0, balance: 12 },
        earnedLeave: { total: 18, used: 0, balance: 18 },
        compensatoryOff: { total: 0, used: 0, balance: 0 },
      };
      
      await set(balanceRef, defaultBalance);
      
      return {
        success: true,
        balance: defaultBalance,
      };
    }
  } catch (error) {
    console.error('Get leave balance error:', error);
    return {
      success: false,
      message: 'Failed to fetch leave balance',
    };
  }
};

/**
 * Update employee leave balance (Admin)
 */
export const updateLeaveBalance = async (employeeId, leaveType, balance) => {
  try {
    const balanceRef = ref(database, `leaveBalances/${employeeId}/${leaveType}`);
    await update(balanceRef, balance);
    
    return {
      success: true,
      message: 'Leave balance updated successfully',
    };
  } catch (error) {
    console.error('Update leave balance error:', error);
    return {
      success: false,
      message: 'Failed to update leave balance',
    };
  }
};

// ==================== SALARY SLIP MANAGEMENT ====================

/**
 * Upload salary slip (Admin)
 */
export const uploadSalarySlip = async (employeeId, slipData) => {
  try {
    const slipsRef = ref(database, `salarySlips/${employeeId}`);
    const newSlipRef = push(slipsRef);
    
    await set(newSlipRef, {
      ...slipData,
      employeeId,
      uploadDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      slipId: newSlipRef.key,
      message: 'Salary slip uploaded successfully',
    };
  } catch (error) {
    console.error('Upload salary slip error:', error);
    return {
      success: false,
      message: 'Failed to upload salary slip',
    };
  }
};

/**
 * Get employee salary slips
 */
export const getEmployeeSalarySlips = async (employeeId) => {
  try {
    const slipsRef = ref(database, `salarySlips/${employeeId}`);
    const snapshot = await get(slipsRef);
    
    if (snapshot.exists()) {
      const slipsData = snapshot.val();
      const slips = Object.keys(slipsData).map(key => ({
        id: key,
        ...slipsData[key],
        uploadDate: new Date(slipsData[key].uploadDate),
      }));
      
      // Sort by date descending
      slips.sort((a, b) => b.uploadDate - a.uploadDate);
      
      return {
        success: true,
        slips,
      };
    } else {
      return {
        success: true,
        slips: [],
      };
    }
  } catch (error) {
    console.error('Get salary slips error:', error);
    return {
      success: false,
      slips: [],
      message: 'Failed to fetch salary slips',
    };
  }
};

/**
 * Get all salary slips (Admin)
 */
export const getAllSalarySlips = async () => {
  try {
    const slipsRef = ref(database, 'salarySlips');
    const snapshot = await get(slipsRef);
    
    if (snapshot.exists()) {
      const allSlips = [];
      const slipsData = snapshot.val();
      
      Object.keys(slipsData).forEach(employeeId => {
        const employeeSlips = slipsData[employeeId];
        Object.keys(employeeSlips).forEach(slipId => {
          allSlips.push({
            id: slipId,
            ...employeeSlips[slipId],
            uploadDate: new Date(employeeSlips[slipId].uploadDate),
          });
        });
      });
      
      // Sort by date descending
      allSlips.sort((a, b) => b.uploadDate - a.uploadDate);
      
      return {
        success: true,
        slips: allSlips,
      };
    } else {
      return {
        success: true,
        slips: [],
      };
    }
  } catch (error) {
    console.error('Get all salary slips error:', error);
    return {
      success: false,
      slips: [],
      message: 'Failed to fetch salary slips',
    };
  }
};

/**
 * Delete salary slip (Admin)
 */
export const deleteSalarySlip = async (employeeId, slipId) => {
  try {
    const slipRef = ref(database, `salarySlips/${employeeId}/${slipId}`);
    await set(slipRef, null);
    
    return {
      success: true,
      message: 'Salary slip deleted successfully',
    };
  } catch (error) {
    console.error('Delete salary slip error:', error);
    return {
      success: false,
      message: 'Failed to delete salary slip',
    };
  }
};

/**
 * Get notifications for a user (Manager or Admin)
 */
export const getNotifications = async (userId) => {
  try {
    console.log('getNotifications called for userId:', userId);
    const notificationsRef = ref(database, 'notifications');
    const snapshot = await get(notificationsRef);
    
    if (snapshot.exists()) {
      const notificationsData = snapshot.val();
      console.log('Total notifications in database:', Object.keys(notificationsData).length);
      const notifications = Object.keys(notificationsData)
        .map(key => ({
          id: key,
          ...notificationsData[key],
          createdAt: new Date(notificationsData[key].createdAt),
        }))
        .filter(notif => {
          // IMPORTANT: Filter out leave_request notifications where user is the employee requesting leave
          // Employees should NEVER see their own leave requests - only managers/admins see those
          if (notif.type === 'leave_request' && notif.employeeId === userId) {
            console.log(`❌ Filtering out leave_request for employee ${userId} (self-notification)`);
            return false;
          }
          
          // Match notifications for this user or admin
          const isRecipient = notif.recipientId === userId || notif.recipientId === 'admin';
          
          // Log for debugging
          console.log(`Notification ${notif.id}: type=${notif.type}, recipientId=${notif.recipientId}, employeeId=${notif.employeeId}, matches=${isRecipient}`);
          
          return isRecipient;
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Filtered notifications for user:', notifications.length);
      return notifications;
    }
    
    console.log('No notifications found in database');
    return [];
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

/**
 * Approve leave request
 */
export const approveLeaveRequest = async (leaveId, notificationId, approverName, approverRole = 'Manager') => {
  try {
    // Update leave status
    const leaveRef = ref(database, `leaves/${leaveId}`);
    const leaveSnapshot = await get(leaveRef);
    
    if (!leaveSnapshot.exists()) {
      return {
        success: false,
        message: 'Leave request not found',
      };
    }
    
    const leaveData = leaveSnapshot.val();
    
    await update(leaveRef, {
      status: 'Approved',
      approvedBy: approverName,
      approvedRole: approverRole,
      approvedDate: new Date().toISOString(),
    });
    
    // Update notification status
    const notifRef = ref(database, `notifications/${notificationId}`);
    await update(notifRef, {
      status: 'Approved',
      actionBy: approverName,
      actionDate: new Date().toISOString(),
    });
    
    // Create notification for employee about approval
    const notificationsRef = ref(database, 'notifications');
    const employeeNotifRef = push(notificationsRef);
    await set(employeeNotifRef, {
      recipientId: leaveData.employeeId,
      type: 'leave_approved',
      leaveId: leaveId,
      title: 'Leave Approved',
      message: `Your ${leaveData.leaveType} request from ${new Date(leaveData.fromDate).toLocaleDateString()} to ${new Date(leaveData.toDate).toLocaleDateString()} has been approved by ${approverName}`,
      leaveType: leaveData.leaveType,
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      approvedBy: approverName,
      createdAt: new Date().toISOString(),
      read: false,
    });
    
    // Update employee leave balance
    const employeeId = leaveData.employeeId;
    const days = leaveData.days;
    const leaveType = leaveData.leaveType;
    
    const balanceRef = ref(database, `leaveBalances/${employeeId}`);
    const balanceSnapshot = await get(balanceRef);
    
    if (balanceSnapshot.exists()) {
      const balance = balanceSnapshot.val();
      
      // Determine which leave type to deduct from
      if (leaveType === 'Casual Leave' || leaveType === 'Sick Leave') {
        const newUsed = (balance.casualSick?.used || 0) + days;
        const newBalance = (balance.casualSick?.total || 12) - newUsed;
        await update(balanceRef, {
          'casualSick/used': newUsed,
          'casualSick/balance': newBalance,
        });
      } else if (leaveType === 'Earned Leave') {
        const newUsed = (balance.earnedLeave?.used || 0) + days;
        const newBalance = (balance.earnedLeave?.total || 18) - newUsed;
        await update(balanceRef, {
          'earnedLeave/used': newUsed,
          'earnedLeave/balance': newBalance,
        });
      } else if (leaveType === 'Compensatory Off') {
        const newUsed = (balance.compensatoryOff?.used || 0) + days;
        const newBalance = (balance.compensatoryOff?.total || 0) - newUsed;
        await update(balanceRef, {
          'compensatoryOff/used': newUsed,
          'compensatoryOff/balance': newBalance,
        });
      }
    }
    
    return {
      success: true,
      message: 'Leave request approved successfully',
    };
  } catch (error) {
    console.error('Approve leave error:', error);
    return {
      success: false,
      message: 'Failed to approve leave request',
    };
  }
};

/**
 * Reject leave request
 */
export const rejectLeaveRequest = async (leaveId, notificationId, rejectorName, rejectorRole = 'Manager', reason = '') => {
  try {
    // Update leave status
    const leaveRef = ref(database, `leaves/${leaveId}`);
    const leaveSnapshot = await get(leaveRef);
    
    if (!leaveSnapshot.exists()) {
      return {
        success: false,
        message: 'Leave request not found',
      };
    }
    
    const leaveData = leaveSnapshot.val();
    
    await update(leaveRef, {
      status: 'Rejected',
      rejectedBy: rejectorName,
      rejectedRole: rejectorRole,
      rejectedDate: new Date().toISOString(),
      rejectionReason: reason,
    });
    
    // Update notification status
    const notifRef = ref(database, `notifications/${notificationId}`);
    await update(notifRef, {
      status: 'Rejected',
      actionBy: rejectorName,
      actionDate: new Date().toISOString(),
      rejectionReason: reason,
    });
    
    // Create notification for employee about rejection
    const notificationsRef = ref(database, 'notifications');
    const employeeNotifRef = push(notificationsRef);
    await set(employeeNotifRef, {
      recipientId: leaveData.employeeId,
      type: 'leave_rejected',
      leaveId: leaveId,
      title: 'Leave Rejected',
      message: `Your ${leaveData.leaveType} request from ${new Date(leaveData.fromDate).toLocaleDateString()} to ${new Date(leaveData.toDate).toLocaleDateString()} has been rejected by ${rejectorName}`,
      leaveType: leaveData.leaveType,
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      rejectedBy: rejectorName,
      rejectionReason: reason,
      createdAt: new Date().toISOString(),
      read: false,
    });
    
    return {
      success: true,
      message: 'Leave request rejected',
    };
  } catch (error) {
    console.error('Reject leave error:', error);
    return {
      success: false,
      message: 'Failed to reject leave request',
    };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifRef = ref(database, `notifications/${notificationId}`);
    await update(notifRef, {
      read: true,
    });
    
    return {
      success: true,
      message: 'Notification marked as read',
    };
  } catch (error) {
    console.error('Mark notification error:', error);
    return {
      success: false,
      message: 'Failed to mark notification as read',
    };
  }
};
