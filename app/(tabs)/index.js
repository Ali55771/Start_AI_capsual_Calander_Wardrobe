import React from "react";
import { View } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider  } from "../../context/UserContext";
import Toast from 'react-native-toast-message';


// Import Screen.
import HomeScreen from "../../Screens/HomeScreen";
import FavoritesScreen from '../../Screens/FavoritesScreen';
import AvatarOption from "../../components/AvatarOption";
import AvatarCustomizationScreen from "../../Screens/AvatarCustomizationScreen";
import AvatarPreviewScreen from "../../Screens/AvatarPreviewScreen";

import WardrobeScreen from "../../Screens/WardrobeScreen";
import AddClothingScreen from "../../Screens/AddClothingScreen";
import ClothingDetailsForm from "../../Screens/ClothingDetailsForm";
import GetStartScreen from "../../Screens/getStart";
import AssignTags from "../../Screens/AssignTags";
import WardrobeSummary from "../../Screens/WardrobeSummary";
import BoxItemsScreen from "../../Screens/BoxItemsScreen";

import ProfileScreen from "../../Screens/ProfileScreen";
import WardrobeOptionsScreen from '../../Screens/WardrobeOptionsScreen';
import WardrobeCreationScreen from '../../Screens/WardrobeCreationScreen';
import CreatedWardrobesScreen from '../../Screens/CreatedWardrobesScreen';
import SelectSeasonScreen from '../../Screens/SelectSeasonScreen';
import AddBoxesScreen from '../../Screens/AddBoxesScreen';
import ViewBoxesScreen from '../../Screens/ViewBoxesScreen';
import MainScreen from '../../Screens/AiRecommendation/MainScreen';
import SavedRecommendationsScreen from '../../Screens/AiRecommendation/SavedRecommendationsScreen';



// Import Calendar Screens
import WelcomeScreen from '../../Screens/CalenderScreens/WelcomeScreen';
import CalendarScreen from '../../Screens/CalenderScreens/CalendarScreen';
import CreateEventScreen from '../../Screens/CalenderScreens/CreateEventScreen';
import SavedEventsScreen from '../../Screens/CalenderScreens/SavedEventsScreen';
import PlanEventScreen from '../../Screens/CalenderScreens/PlanEventScreen';
import AddAlarmScreen from '../../Screens/CalenderScreens/AddAlarmScreen';
import ReminderScreen from '../../Screens/CalenderScreens/ReminderScreen';
import NotificationsScreen from '../../Screens/CalenderScreens/NotificationsScreen';
import AIRecommendationScreen from '../../Screens/CalenderScreens/AIRecommendationScreen';
import CalendarWardrobeScreen from '../../Screens/CalenderScreens/CalendarWardrobeScreen';
import ShirtsScreen from '../../Screens/CalenderScreens/ShirtsScreen';
import PantsScreen from '../../Screens/CalenderScreens/PantsScreen';
import ShoesScreen from '../../Screens/CalenderScreens/ShoesScreen';
import SelectWardrobeScreen from '../../Screens/CalenderScreens/SelectWardrobeScreen';
import SelectItemsScreen from '../../Screens/CalenderScreens/SelectItemsScreen';

// Import authentication screens
import LoginScreen from "../../Screens/LoginScreen";
import SignUpScreen from "../../Screens/SignUpScreen";
import ForgotPasswordScreen from "../../Screens/ForgotPasswordScreen";

import MyappStart from '../../Screens/MyappStart';

import IntroScreen from "../../Screens/AiRecommendation/IntroScreen";
import SelectionScreen from "../../Screens/AiRecommendation/SelectionScreen";
import RecommendationScreen from "../../Screens/AiRecommendation/RecommendationScreen";
import FinalScreen from '../../Screens/AiRecommendation/FinalScreen';
import WardrobePreviewScreen from '../../Screens/WardrobePreviewScreen';
import CapsuleWardrobeScreen from '../../Screens/CapsuleWardrobeScreen';
import CapsuleCombinationsScreen from '../../Screens/CapsuleCombinationsScreen';
import CapsuleEntryScreen from '../../Screens/CapsuleEntryScreen';
import SavedCombinationsScreen from '../../Screens/SavedCombinationsScreen';

import CalendarTabNavigator from '../../navigation/CalendarTabNavigator';


const Stack = createStackNavigator();

export default function IndexScreen() {
  return (
    <UserProvider>
      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="MyappStart" screenOptions={{ headerShown: false }}>


          
          {/* Authentication Screens */}
          <Stack.Screen name="MyappStart" component={MyappStart} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />

          {/* Home Screen */}
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          

          {/* Wardrobe Screens */}

          <Stack.Screen name="WardrobeScreen" component={WardrobeScreen} />
          <Stack.Screen name="AddClothingScreen" component={AddClothingScreen} />
          <Stack.Screen name="ClothingDetailsForm" component={ClothingDetailsForm} />
          <Stack.Screen name="BoxItemsScreen" component={BoxItemsScreen} />

          {/* Avatar Screens */}
          <Stack.Screen name="AvatarOption" component={AvatarOption} />
          <Stack.Screen name="AvatarCustomizationScreen" component={AvatarCustomizationScreen} />
          <Stack.Screen name="AvatarPreviewScreen" component={AvatarPreviewScreen} />

          {/* Wardrobe Setup Screens */}
          <Stack.Screen name="GetStart" component={GetStartScreen} />
          <Stack.Screen name="MainScreen" component={MainScreen} />

        
          <Stack.Screen name="AssignTags" component={AssignTags} />
          <Stack.Screen name="WardrobeSummary" component={WardrobeSummary} />
          
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="WardrobeOptionsScreen" component={WardrobeOptionsScreen} />
          <Stack.Screen name="WardrobeCreationScreen" component={WardrobeCreationScreen} />
          <Stack.Screen name="CreatedWardrobesScreen" component={CreatedWardrobesScreen} />
          <Stack.Screen name="SelectSeasonScreen" component={SelectSeasonScreen} />
          <Stack.Screen name="AddBoxesScreen" component={AddBoxesScreen} />
          <Stack.Screen name="ViewBoxesScreen" component={ViewBoxesScreen} />

          {/* Calendar Screens */}
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
          <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
          <Stack.Screen name="SavedEventsScreen" component={SavedEventsScreen} />
          <Stack.Screen name="PlanEventScreen" component={PlanEventScreen} />
          <Stack.Screen name="AddAlarmScreen" component={AddAlarmScreen} />
          <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
          <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
          <Stack.Screen name="AIRecommendationScreen" component={AIRecommendationScreen} />
          <Stack.Screen name="CalendarWardrobeScreen" component={CalendarWardrobeScreen} />
          <Stack.Screen name="ShirtsScreen" component={ShirtsScreen} />
          <Stack.Screen name="PantsScreen" component={PantsScreen} />
          <Stack.Screen name="ShoesScreen" component={ShoesScreen} />

          {/* Manual Outfit Planning Screens */}
          <Stack.Screen name="SelectWardrobeScreen" component={SelectWardrobeScreen} />
          <Stack.Screen name="SelectItemsScreen" component={SelectItemsScreen} />
          <Stack.Screen name="IntroScreen" component={IntroScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RecommendationScreen" component={RecommendationScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="FinalScreen" component={FinalScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WardrobePreviewScreen" component={WardrobePreviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CapsuleWardrobeScreen" component={CapsuleWardrobeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CapsuleCombinationsScreen" component={CapsuleCombinationsScreen} />
          <Stack.Screen name="CapsuleEntryScreen" component={CapsuleEntryScreen} />
          <Stack.Screen name="SavedCombinationsScreen" component={SavedCombinationsScreen} />
          <Stack.Screen name="SavedRecommendationsScreen" component={SavedRecommendationsScreen} options={{ headerShown: false }} />
          

           
        </Stack.Navigator>
        <Toast />
      </View>
    </UserProvider>
  );
}
