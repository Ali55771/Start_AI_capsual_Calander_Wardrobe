import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNav from '../components/BottomNav';

// Import all Calendar screens
import CalendarScreen from '../Screens/CalenderScreens/CalendarScreen';
import CreateEventScreen from '../Screens/CalenderScreens/CreateEventScreen';
import SavedEventsScreen from '../Screens/CalenderScreens/SavedEventsScreen';
import PlanEventScreen from '../Screens/CalenderScreens/PlanEventScreen';
import AddAlarmScreen from '../Screens/CalenderScreens/AddAlarmScreen';
import ReminderScreen from '../Screens/CalenderScreens/ReminderScreen';
import CalendarWardrobeScreen from '../Screens/CalenderScreens/CalendarWardrobeScreen';
import ShirtsScreen from '../Screens/CalenderScreens/ShirtsScreen';
import PantsScreen from '../Screens/CalenderScreens/PantsScreen';
import ShoesScreen from '../Screens/CalenderScreens/ShoesScreen';
import SelectWardrobeScreen from '../Screens/CalenderScreens/SelectWardrobeScreen';
import SelectItemsScreen from '../Screens/CalenderScreens/SelectItemsScreen';

const Stack = createStackNavigator();

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
      <Stack.Screen name="SavedEventsScreen" component={SavedEventsScreen} />
      <Stack.Screen name="PlanEventScreen" component={PlanEventScreen} />
      <Stack.Screen name="AddAlarmScreen" component={AddAlarmScreen} />
      <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
      <Stack.Screen name="CalendarWardrobeScreen" component={CalendarWardrobeScreen} />
      <Stack.Screen name="ShirtsScreen" component={ShirtsScreen} />
      <Stack.Screen name="PantsScreen" component={PantsScreen} />
      <Stack.Screen name="ShoesScreen" component={ShoesScreen} />
      <Stack.Screen name="SelectWardrobeScreen" component={SelectWardrobeScreen} />
      <Stack.Screen name="SelectItemsScreen" component={SelectItemsScreen} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function CalendarTabNavigator() {
  return (
    <Tab.Navigator tabBar={props => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Calendar" component={CalendarStack} />
    </Tab.Navigator>
  );
} 