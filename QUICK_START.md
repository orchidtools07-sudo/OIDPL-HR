# OIDPL-HR App - Quick Start Guide

## 🚀 Running the App

The Expo development server is currently running. You can:

1. **On Android Device/Emulator**: Press `a`
2. **On iOS Device/Simulator**: Press `i` (macOS only)
3. **On Web Browser**: Press `w`
4. **Scan QR Code**: Use Expo Go app on your phone

## 📱 Testing the App

### Test Employee Flow
1. Login with: `employee@oidpl.com` / `123456`
2. Toggle location sharing ON/OFF
3. View your location on the map
4. Open drawer menu (hamburger icon)
5. Navigate to Notifications
6. Logout

### Test Admin Flow
1. Login with: `admin@oidpl.com` / `123456`
2. View animated employee counter (counts to 25)
3. See 3 employee preview cards
4. Click "View on Map" for any employee
5. Go back and click "View All Employees"
6. Browse all 25 employees
7. Click "View on Map" to see individual locations

## 🎨 UI Features to Notice

### Animations
- ✅ Fade-in on screen load
- ✅ Animated counter on admin dashboard
- ✅ Marquee scrolling text on employee dashboard
- ✅ Smooth page transitions
- ✅ Toggle switch animation with status text change

### Design Elements
- ✅ Luxury rounded cards with soft shadows
- ✅ Primary blue (#006dc0) and gold accent (#f7cf49)
- ✅ Clean typography and spacing
- ✅ Intuitive icon usage
- ✅ Premium color scheme

## 📁 Project Structure

```
OIDPL-HR-App/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AnimatedMarquee.js
│   │   ├── EmployeeCard.js
│   │   ├── LocationToggle.js
│   │   └── MapCard.js
│   ├── constants/
│   │   └── theme.js       # Colors, fonts, spacing
│   ├── data/
│   │   └── mockData.js    # 25 demo employees + credentials
│   ├── navigation/
│   │   └── AppNavigator.js # Stack + Drawer navigation
│   ├── screens/           # All app screens
│   │   ├── LoginScreen.js
│   │   ├── EmployeeDashboard.js
│   │   ├── AdminDashboard.js
│   │   ├── EmployeeTrackingScreen.js
│   │   ├── EmployeeMapScreen.js
│   │   └── NotificationsScreen.js
│   └── utils/
│       └── auth.js        # Login validation
├── App.js                 # Main app entry
└── README.md             # Full documentation
```

## 🛠️ Making Changes

### Adding New Employees
Edit `src/data/mockData.js` and add to the `EMPLOYEES` array

### Changing Colors
Edit `src/constants/theme.js`

### Adding New Screens
1. Create screen in `src/screens/`
2. Add route in `src/navigation/AppNavigator.js`

## 🔧 Useful Commands

```bash
# Start dev server
npm start

# Start with cache clear
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

## ⚠️ Notes

- Maps use demo/static coordinates (no GPS permissions needed)
- All data is hardcoded (no backend required)
- App is structured for easy Firebase integration later
- Press Ctrl+C to stop the Expo dev server

## 🐛 Troubleshooting

If you encounter issues:

1. **Clear cache**: Press Shift+M in Expo → Clear bundler cache
2. **Reload app**: Press R in Expo
3. **Restart server**: Ctrl+C then `npm start`
4. **Reinstall**: `rm -rf node_modules && npm install`

## 📝 Demo Data

- **Total Employees**: 25
- **Employee Names**: Indian names (Vikrant, Priya, Rahul, etc.)
- **Locations**: Various Gurugram sectors with real coordinates
- **All features**: Fully working with demo data

## 🎯 What's Working

✅ Role-based authentication  
✅ Employee dashboard with location toggle  
✅ Animated marquee text  
✅ Map integration  
✅ Admin dashboard with stats  
✅ Animated employee counter  
✅ Employee list (all 25)  
✅ Individual employee map view  
✅ Drawer navigation (Employee)  
✅ Stack navigation (Admin)  
✅ Logout functionality  
✅ Notifications screen (demo)  

## 🚀 Ready for Firebase

The app structure allows easy integration:
- Replace `utils/auth.js` with Firebase Auth
- Replace `data/mockData.js` with Firestore
- Add Firebase Realtime Database for live location tracking

---

**Need Help?** Check README.md for full documentation.
