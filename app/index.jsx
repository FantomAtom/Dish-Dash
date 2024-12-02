import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth'; // Firebase auth listener
import { auth } from '../configs/FirebaseConfig';

import { Defines } from '../constants/Defines';
import TabNavigator from './Navigators/TabNavigator';
import LoginPage from '../components/Login';
import SignInPage from './auth/sign-in';
import SignUpPage from './auth/sign-up';
import PlaceOrderPage from './tabs/PlaceOrder';
import ProfilePage from './tabs/profile';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null); // Track user authentication state
  const [loading, setLoading] = useState(true); // Track loading state
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('./../assets/fonts/Poppins-Light.ttf'),
  });

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once the state is resolved
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Display a loading indicator until authentication and fonts are loaded
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Defines.Colors.HighlightColor} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Defines.Colors.Black} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      >
        {user ? (
          <>
            {/* Main App Screens */}
            <Stack.Screen name="MainHome" component={TabNavigator} />
            <Stack.Screen name="PlaceOrder" component={PlaceOrderPage} />
            <Stack.Screen name="Profile" component={ProfilePage} />
          </>
        ) : (
          <>
            {/* Authentication Screens */}
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="SignIn" component={SignInPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default App;
