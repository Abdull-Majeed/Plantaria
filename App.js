import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import CommunityPage from './screens/CommunityPage';
import VendorScreen from './screens/VenderScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import SplashScreen from './screens/SplashScreen';
import Header from './screens/header/Header';
import ChatScreen from './screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        global.token = token;
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Bottom" options={{ headerShown: false }}>
          {(props) => (
            <BottomNavigation
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }}>
          {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="Chat" options={{ headerShown: false }}>
          {(props) => <ChatScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

function BottomNavigation({ isLoggedIn, setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: route.name,
        tabBarIcon: () => {
          const icons = {
            Home: '🏠',
            Community: '👥',
            Vendor: '🏪',
            Profile: '👤',
          };
          return <Text style={styles.iconText}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          header: () => <Header />, 
          headerShown: true 
        }} 
      />
      <Tab.Screen 
        name="Community" 
        options={{ 
          header: () => <Header />, 
          headerShown: true 
        }}>
        {(props) => (isLoggedIn ? <CommunityPage {...props} /> : <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />)}
      </Tab.Screen>
      <Tab.Screen 
        name="Vendor" 
        options={{ 
          header: () => <Header />, 
          headerShown: true 
        }}>
        {(props) => (isLoggedIn ? <VendorScreen {...props} /> : <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />)}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{ 
          header: () => <Header />, 
          headerShown: true 
        }}>
        {(props) => (isLoggedIn ? <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} /> : <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />)}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconText: {
    fontSize: 24,
    textAlign: 'center',
  },
});