import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Defines } from '../../constants/Defines';

// Screens
import HomePage from '../tabs/home';
import CartPage from '../tabs/cart';

const Tab = createBottomTabNavigator();

const tabBarOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: Defines.Colors.PrimaryWhite,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabelStyle: {
    fontSize: 15,
    fontFamily: Defines.Fonts.Bold,
  },
  tabBarActiveTintColor: Defines.Colors.Black,
  tabBarInactiveTintColor: Defines.Colors.tabBarInactiveTintColor,
};

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'Food',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="bowl-food" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="shoppingcart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
