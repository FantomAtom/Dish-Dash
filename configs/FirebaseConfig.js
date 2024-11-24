import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyANX-s8VaJywtCf7q05wSLjBDAvmp2ihu4",
  authDomain: "dishdash-e28cf.firebaseapp.com",
  projectId: "dishdash-e28cf",
  storageBucket: "dishdash-e28cf.appspot.com",
  messagingSenderId: "132035113047",
  appId: "1:132035113047:web:f11b859c873f036da67312",
  measurementId: "G-CYKQK51FFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Set up Firebase Authentication with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)  // Ensure persistence with AsyncStorage
});

const db = getFirestore(app);  // Initialize Firestore
const imageDb = getStorage(app);  // Initialize Storage

export { auth, db, imageDb };
