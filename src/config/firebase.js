import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH4RVEMEjNRnnMwUVeWkrru-cB3balHe0",
  authDomain: "oidpl-hr.firebaseapp.com",
  databaseURL: "https://oidpl-hr-default-rtdb.firebaseio.com",
  projectId: "oidpl-hr",
  storageBucket: "oidpl-hr.firebasestorage.app",
  messagingSenderId: "468781174550",
  appId: "1:468781174550:web:dbc13e497d4c83ee574a37",
  measurementId: "G-2X4VQ7NN97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database = getDatabase(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const storage = getStorage(app);

export default app;
