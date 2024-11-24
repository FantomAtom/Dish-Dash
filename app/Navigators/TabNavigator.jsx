//Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Defines } from '../../constants/Defines';

import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';

import HomePage from '../tabs/home';
import MenuPage from '../tabs/menu';
import CartPage from '../tabs/cart';
import ProfilePage from '../tabs/profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Defines.Colors.ButtonColor,
          height: 70,
          paddingBottom: 5,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontFamily: Defines.Fonts.Bold,
          color: Defines.Colors.TextColorWhite,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerShown: false,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: Defines.Fonts.Bold,
          color: Defines.Colors.TextColorBlack,
        },
        headerStyle: {
          backgroundColor: Defines.Colors.HeaderColor,
          height: 80,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuPage}
        options={{
          tabBarLabel: 'Menu',
          headerTitle: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={{
          tabBarLabel: 'Cart',
          headerTitle: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="shoppingcart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Fontisto name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
