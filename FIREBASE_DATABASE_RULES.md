# Firebase Realtime Database Rules Update

## Issue
You're getting "Permission denied" errors because Firebase Realtime Database rules are blocking access to:
- `/leaves/`
- `/leaveBalances/`
- `/notifications/`
- `/employees/`
- `/salarySlips/`

## Solution - Update Firebase Rules

### Method 1: Firebase Console (Recommended)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Realtime Database**
   - Click "Realtime Database" in left sidebar
   - Click "Rules" tab at the top

3. **Replace Current Rules**
   - Delete existing rules
   - Copy and paste this:

```json
{
  "rules": {
    "employees": {
      ".read": true,
      ".write": true
    },
    "leaves": {
      ".read": true,
      ".write": true
    },
    "leaveBalances": {
      ".read": true,
      ".write": true
    },
    "notifications": {
      ".read": true,
      ".write": true
    },
    "salarySlips": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. **Publish Rules**
   - Click "Publish" button
   - Wait for confirmation

### Method 2: Firebase CLI

If you have Firebase CLI installed:

```bash
cd OIDPL-HR-App
firebase deploy --only database
```

## Security Note ⚠️

**Current rules allow full read/write access for development.**

For production, implement proper security:

```json
{
  "rules": {
    "employees": {
      ".read": "auth != null",
      "$employeeId": {
        ".write": "auth != null && (root.child('employees/' + auth.uid + '/role').val() === 'admin' || auth.uid === $employeeId)"
      }
    },
    "leaves": {
      ".read": "auth != null",
      "$leaveId": {
        ".write": "auth != null && (root.child('employees/' + auth.uid + '/role').val() === 'admin' || data.child('employeeId').val() === auth.uid)"
      }
    },
    "leaveBalances": {
      "$employeeId": {
        ".read": "auth != null && (root.child('employees/' + auth.uid + '/role').val() === 'admin' || auth.uid === $employeeId)",
        ".write": "auth != null && root.child('employees/' + auth.uid + '/role').val() === 'admin'"
      }
    },
    "notifications": {
      "$notificationId": {
        ".read": "auth != null && (data.child('recipientId').val() === auth.uid || data.child('recipientId').val() === 'admin')",
        ".write": "auth != null"
      }
    },
    "salarySlips": {
      "$employeeId": {
        ".read": "auth != null && (root.child('employees/' + auth.uid + '/role').val() === 'admin' || auth.uid === $employeeId)",
        ".write": "auth != null && root.child('employees/' + auth.uid + '/role').val() === 'admin'"
      }
    }
  }
}
```

## After Updating Rules

1. **Restart your app** - Stop Metro bundler and restart
2. **Clear cache** if needed:
   ```bash
   npx expo start -c
   ```

3. **Test the app** - All features should work now!

## Verification

After updating rules, you should see:
✅ No "Permission denied" errors
✅ Leave management loads data
✅ Notifications display properly
✅ Salary slips accessible
✅ Employee list loads in manager dropdown

## Files Created
- `database.rules.json` - Ready to deploy with Firebase CLI
- Just run: `firebase deploy --only database`
