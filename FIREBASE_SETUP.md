# Firebase Setup Instructions for OIDPL-HR App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `OIDPL-HR`
4. Follow the setup wizard

## Step 2: Enable Realtime Database

1. In Firebase Console, click "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose location (e.g., us-central1)
4. Start in **Test Mode** (for development)
5. Click "Enable"

## Step 3: Set Database Rules (Important!)

In the Realtime Database, go to "Rules" tab and paste:

```json
{
  "rules": {
    "employees": {
      ".read": true,
      ".write": true,
      "$employeeId": {
        ".validate": "newData.hasChildren(['name', 'code', 'mobile', 'designation', 'department', 'password'])"
      }
    }
  }
}
```

**Note:** These rules allow read/write for development. For production, implement proper authentication.

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click "Web" button (</>)
4. Register app with name: `OIDPL-HR-App`
5. Copy the `firebaseConfig` object

## Step 5: Add Config to Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Test the Setup

1. Run the app: `npm start`
2. Login as admin: `admin@oidpl.com` / `123456`
3. Click "Add" button to add an employee
4. Fill the form and submit
5. Check Firebase Console → Realtime Database to see the new employee data

## Employee Login

Once employees are added by admin, they can login using:
- **Username**: Their mobile number (without spaces or +91)
- **Password**: The password set by admin

Example:
- Mobile: `9876543210`
- Password: `password123`

## Database Structure

```
employees/
  └── {auto-generated-id}/
      ├── name: "John Doe"
      ├── code: "EMP001"
      ├── mobile: "9876543210"
      ├── designation: "Software Engineer"
      ├── department: "IT"
      ├── password: "password123"
      ├── active: true
      ├── createdAt: "2025-12-22T10:30:00.000Z"
      └── location: {
            lat: 28.4595,
            lon: 77.0266,
            address: "Gurugram Sector 51",
            lastUpdated: "2025-12-22T10:30:00.000Z"
          }
```

## Security Considerations

⚠️ **For Production:**

1. **Implement Firebase Authentication**
2. **Update Database Rules** to restrict access:
```json
{
  "rules": {
    "employees": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}
```
3. **Hash Passwords** - Never store plain text passwords
4. **Use Environment Variables** for Firebase config
5. **Enable Firebase App Check** to prevent abuse

## Troubleshooting

**Error: "Permission Denied"**
- Check Database Rules are set correctly
- Ensure database URL is correct in config

**Error: "Firebase not initialized"**
- Verify firebase config values are correct
- Check if firebase package is installed: `npm install firebase`

**Employees not showing**
- Check if employees exist in Firebase Console
- Check console logs for errors
- Verify getAllEmployees() is being called

## Additional Features to Implement

- [ ] Real-time employee location tracking
- [ ] Employee attendance system
- [ ] Push notifications
- [ ] Employee photo upload to Firebase Storage
- [ ] Leave management
- [ ] Performance tracking

---

For more information, visit [Firebase Documentation](https://firebase.google.com/docs)
