import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../configs/FirebaseConfig';

import TabNavigator from './Navigators/TabNavigator';
import LoginPage from '../components/Login';
import SignInPage from './auth/sign-in';
import SignUpPage from './auth/sign-up';
import PlaceOrderPage from './tabs/PlaceOrder';
import ProfilePage from './tabs/profile';
import { Defines } from '../constants/Defines';

import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import this

const Stack = createNativeStackNavigator();

const App = () => {
  const [user] = useAuthState(auth); // Check user authentication
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('./../assets/fonts/Poppins-Light.ttf'),
  });

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // Once fonts are loaded, display the main content
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* Wrap the app with this */}
      <StatusBar barStyle="light-content" backgroundColor={Defines.Colors.StatusBarColor} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom', 
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainHome" component={TabNavigator} />
            <Stack.Screen name="PlaceOrder" component={PlaceOrderPage} />
            <Stack.Screen name="Profile" component={ProfilePage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="SignIn" component={SignInPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
          </>
        )}
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default App;
