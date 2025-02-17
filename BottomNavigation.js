import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import HomeScreen from './screens/HomeScreen';
import HomeScreen from './HomeScreen';
import CommunityPage from './CommunityPage';
import VendorScreen from './VenderScreen';
import ProfileScreen from './ProfileScreen';
import LoginSignupScreen from './LoginSignupScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { display: 'flex' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarStyle: { display: 'flex' },
          }}
        />

        <Tab.Screen
          name="Community"
          component={isLoggedIn ? CommunityPage : LoginSignupScreen}
          options={{
            headerShown: false,
            tabBarStyle: { display: isLoggedIn ? 'flex' : 'none' },
          }}
          initialParams={{ targetScreen: 'Community' }}
        />
        <Tab.Screen
          name="Vendor"
          component={isLoggedIn ? VendorScreen : LoginSignupScreen}
          options={{
            headerShown: false,
            tabBarStyle: { display: isLoggedIn ? 'flex' : 'none' },
          }}
          initialParams={{ targetScreen: 'Vendor' }}
        />
        <Tab.Screen
          name="Profile"
          component={isLoggedIn ? ProfileScreen : LoginSignupScreen}
          options={{
            headerShown: false,
            tabBarStyle: { display: isLoggedIn ? 'flex' : 'none' },
          }}
          initialParams={{ targetScreen: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
