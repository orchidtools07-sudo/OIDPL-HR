# Firebase Database Rules Update Required

## Issue
You're getting "Permission denied" error when trying to access location history because the Firebase rules need to allow read access to the `locationHistory` node.

## Steps to Fix

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `oidpl-hr`
3. **Navigate to**: Realtime Database → Rules
4. **Replace the current rules with**:

```json
{
  "rules": {
    "employees": {
      ".read": true,
      ".write": true,
      ".indexOn": ["code", "mobile"]
    },
    "locationHistory": {
      ".read": true,
      ".write": true,
      "$employeeId": {
        ".indexOn": ["timestamp"]
      }
    },
    "notifications": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp", "read"]
    }
  }
}
```

5. **Click "Publish"**

## What This Does

- **`employees` node**: Allows reading/writing employee data with indexes on code and mobile
- **`locationHistory` node**: 
  - Allows reading/writing location history for all employees
  - Adds index on `timestamp` for efficient querying by date
  - Each employee's location history is stored under their employee ID

## Security Note

⚠️ **For Production**: These rules allow open access. Before deploying to production, you should:
1. Implement Firebase Authentication
2. Restrict access based on authenticated users
3. Use security rules like:
```json
{
  "rules": {
    "employees": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.role == 'admin'"
    },
    "locationHistory": {
      ".read": "auth != null && auth.token.role == 'admin'",
      ".write": "auth != null"
    }
  }
}
```

## After Publishing Rules

1. **Restart your app**
2. **Login as Admin**
3. **Navigate to Employee Tracking**
4. **Click "Download Report" on any employee card**
5. **Select a date from the calendar**
6. **Excel file will be generated and downloaded**

## Auto-Cleanup Feature

Location history older than 10 days is automatically deleted when admin logs in to save database storage.
