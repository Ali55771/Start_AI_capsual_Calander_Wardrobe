import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider, UserContext } from './context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './services/NotificationService';

// Import all screens
import MyappStart from './Screens/MyappStart';
import OnboardingScreen from './Screens/OnboardingScreen';
import LoginScreen from './Screens/LoginScreen';
import SignUpScreen from './Screens/SignUpScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen';
import HomeScreen from './Screens/HomeScreen';
import FavoritesScreen from './Screens/FavoritesScreen';
import ProfileScreen from './Screens/ProfileScreen';
import WardrobeScreen from './Screens/WardrobeScreen';
import AddClothingScreen from './Screens/AddClothingScreen';
import ClothingDetailsScreen from './Screens/ClothingDetailsScreen';
import CreateEventScreen from './Screens/CalenderScreens/CreateEventScreen';
import CalenderWelcome from './Screens/CalenderScreens/WelcomeScreen';
import NotificationsScreen from './Screens/CalenderScreens/NotificationsScreen';
import AvatarOption from './components/AvatarOption';
import AvatarCustomizationScreen from './Screens/AvatarCustomizationScreen';
import IntroScreen from './Screens/AiRecommendation/IntroScreen';
import SelectionScreen from './Screens/AiRecommendation/SelectionScreen';
import RecommendationScreen from './Screens/AiRecommendation/RecommendationScreen';
import FinalScreen from './Screens/AiRecommendation/FinalScreen';
import GetStartScreen from './Screens/getStart';
import CreateWardrobe from './Screens/createWardrobe';
import AssignTags from './Screens/AssignTags';
import WardrobeSummary from './Screens/WardrobeSummary';
import WardrobeSetup from './Screens/WardrobeSetup';
import WardrobeOverview from './Screens/WardrobeOverview';
import WardrobePreviewScreen from './Screens/WardrobePreviewScreen';
import WardrobeOptionsScreen from './Screens/WardrobeOptionsScreen';
import WardrobeCreationScreen from './Screens/WardrobeCreationScreen';
import SelectSeasonScreen from './Screens/SelectSeasonScreen';
import ViewBoxesScreen from './Screens/ViewBoxesScreen';
import BoxItemsScreen from './Screens/BoxItemsScreen';

import 'react-native-gesture-handler';
import 'react-native-reanimated';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const commonScreenOptions = { headerShown: false };

// Stacks for each tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="IntroScreen" component={IntroScreen} />
    <Stack.Screen name="SelectionScreen" component={SelectionScreen} />
    <Stack.Screen name="RecommendationScreen" component={RecommendationScreen} />
    <Stack.Screen name="FinalScreen" component={FinalScreen} />
    <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
  </Stack.Navigator>
);

const WardrobeStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="WardrobeScreen" component={WardrobeScreen} />
    <Stack.Screen name="AddClothingScreen" component={AddClothingScreen} />
    <Stack.Screen name="ClothingDetailsScreen" component={ClothingDetailsScreen} />
    <Stack.Screen name="GetStart" component={GetStartScreen} />
    <Stack.Screen name="CreateWardrobe" component={CreateWardrobe} />
    <Stack.Screen name="AssignTags" component={AssignTags} />
    <Stack.Screen name="WardrobeSummary" component={WardrobeSummary} />
    <Stack.Screen name="WardrobeSetup" component={WardrobeSetup} />
    <Stack.Screen name="WardrobeOverview" component={WardrobeOverview} />
    <Stack.Screen name="WardrobePreviewScreen" component={WardrobePreviewScreen} />
    <Stack.Screen name="WardrobeOptionsScreen" component={WardrobeOptionsScreen} />
    <Stack.Screen name="WardrobeCreationScreen" component={WardrobeCreationScreen} />
    <Stack.Screen name="SelectSeasonScreen" component={SelectSeasonScreen} />
    <Stack.Screen name="ViewBoxesScreen" component={ViewBoxesScreen} />
    <Stack.Screen name="BoxItemsScreen" component={BoxItemsScreen} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="CalenderWelcome" component={CalenderWelcome} />
    <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
  </Stack.Navigator>
);

const FavoritesStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="AvatarOption" component={AvatarOption} />
    <Stack.Screen name="AvatarCustomizationScreen" component={AvatarCustomizationScreen} />
  </Stack.Navigator>
);

// Bottom Tab Navigator wiring up the stacks
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wardrobe') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9B673E',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Wardrobe" component={WardrobeStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// Stack for authentication flow
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={commonScreenOptions}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Component to decide which navigator to show
function RootNavigator() {
  const { user } = useContext(UserContext);
  return user ? <MainTabNavigator /> : <AuthStack />;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem('onboardingComplete');
        if (hasOnboarded === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (err) {
        console.error('Failed to get onboarding status', err);
        setIsFirstLaunch(false);
      } finally {
        setTimeout(() => setIsLoading(false), 2500);
      }
    };

    // Initialize notification service
    const initializeNotifications = async () => {
      try {
        await NotificationService.initialize();
        console.log('Notification service initialized');
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    checkOnboardingStatus();
    initializeNotifications();

    // Cleanup notification service on app unmount
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      setIsFirstLaunch(false);
    } catch (err) {
      console.error('Failed to save onboarding status', err);
    }
  };

  if (isLoading) {
    return <MyappStart />;
  }

  return (
    <UserProvider>
      <NavigationContainer>
        {isFirstLaunch ? (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        ) : (
          <RootNavigator />
        )}
      </NavigationContainer>
    </UserProvider>
  );
}