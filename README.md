# OIDPL-HR Mobile App

A luxury, modern HR mobile application built with React Native (Expo) for employee tracking and management.

## Features

### 🔐 Authentication
- Role-based login system
- Employee and Admin access levels
- Hardcoded demo credentials for testing

### 👤 Employee Features
- Location sharing toggle
- Real-time location tracking on map
- Animated information banner
- Side menu drawer navigation

### 🧑‍💼 Admin Features
- Dashboard with employee statistics
- Animated employee counter
- Employee list view (25 employees)
- Individual employee location tracking
- View employees on map

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Drawer)
- **Maps**: react-native-maps
- **Icons**: @expo/vector-icons
- **State Management**: React Hooks

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for mobile testing)

### Setup

1. Clone the repository
```bash
cd OIDPL-HR-App
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Run on device/emulator
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web
- Or scan the QR code with Expo Go app

## Demo Credentials

### Employee Login
- Email: `employee@oidpl.com`
- Password: `123456`

### Admin Login
- Email: `admin@oidpl.com`
- Password: `123456`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedMarquee.js
│   ├── EmployeeCard.js
│   ├── LocationToggle.js
│   └── MapCard.js
├── constants/          # Theme colors, fonts, spacing
│   └── theme.js
├── data/              # Mock data for demo
│   └── mockData.js
├── navigation/        # Navigation configuration
│   └── AppNavigator.js
├── screens/           # App screens
│   ├── LoginScreen.js
│   ├── EmployeeDashboard.js
│   ├── AdminDashboard.js
│   ├── EmployeeTrackingScreen.js
│   ├── EmployeeMapScreen.js
│   └── NotificationsScreen.js
└── utils/            # Helper functions
    └── auth.js
```

## Design System

### Colors
- Primary: `#006dc0` (Blue)
- Secondary: `#f7cf49` (Gold)
- Background: `#f5f5f5` (Light Gray)

### Features
- Luxury & premium UI
- Rounded cards with soft shadows
- Smooth animations (Fade, Slide, Counter)
- Clean typography
- Intuitive navigation

## Navigation Flow

### Employee Flow
```
Login → Employee Dashboard (Drawer)
  ├── Dashboard (Location toggle, Map)
  ├── Notifications
  └── Logout
```

### Admin Flow
```
Login → Admin Dashboard (Stack)
  ├── Dashboard (Stats, Employee preview)
  ├── Employee Tracking (Full employee list)
  └── Employee Map (Individual location)
```

## Mock Data

The app includes 25 demo employees with:
- Indian names
- Employee codes (EMP001-EMP025)
- Mobile numbers
- Gurugram locations with coordinates

## Future Enhancements

- Firebase authentication
- Real-time location tracking
- Push notifications
- Attendance management
- Leave requests
- Performance analytics

## Development

### Adding New Features

The app is structured for easy Firebase integration:

1. **Authentication**: Replace `utils/auth.js` with Firebase Auth
2. **Data**: Replace `data/mockData.js` with Firestore queries
3. **Location**: Integrate Firebase Realtime Database for live tracking

### Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## Troubleshooting

### Maps not showing
- Ensure proper API keys for Google Maps (Android)
- iOS uses default Apple Maps

### Navigation errors
- Clear Metro bundler cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Drawer not opening
- Ensure `react-native-gesture-handler` is imported at the top of App.js

## License

This is a demo application. All rights reserved.

## Support

For issues or questions, please contact the development team.
