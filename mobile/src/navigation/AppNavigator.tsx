import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SalonsScreen from '../screens/SalonsScreen';
import SalonDetailScreen from '../screens/SalonDetailScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import JobsScreen from '../screens/JobsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingScreen from '../screens/BookingScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  SalonDetail: { id: string };
  BookAppointment: { salonId: string; serviceId?: string };
};

export type TabParamList = {
  Home: undefined;
  Salons: undefined;
  Shop: undefined;
  Jobs: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Salons') iconName = focused ? 'cut' : 'cut-outline';
          else if (route.name === 'Shop') iconName = focused ? 'bag' : 'bag-outline';
          else if (route.name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#800020',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Salons" component={SalonsScreen} />
      <Tab.Screen name="Shop" component={MarketplaceScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Create Account' }} />
        <Stack.Screen name="SalonDetail" component={SalonDetailScreen} options={{ headerShown: true, title: 'Salon' }} />
        <Stack.Screen name="BookAppointment" component={BookingScreen} options={{ headerShown: true, title: 'Book Appointment' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
