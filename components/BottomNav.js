import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const NUM_ICONS = 4; // Excluding the center button
const TAB_WIDTH = width / NUM_ICONS;

const NavButton = ({ icon, onPress, isActive }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const IconComponent = icon.lib;

  return (
    <Pressable onPress={onPress} style={styles.navButton}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <IconComponent name={icon.name} size={24} color={isActive ? '#EFEBE9' : '#A1887F'} />
      </Animated.View>
    </Pressable>
  );
};

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(UserContext);
  const [activeScreen, setActiveScreen] = useState(route.name);

  const icons = [
    { name: 'home', screen: 'HomeScreen', lib: FontAwesome5 },
    { name: 'calendar-today', screen: 'CalendarScreen', lib: MaterialIcons },
    { name: 'add', screen: 'AddClothingScreen', lib: Ionicons, isCenter: true },
    { name: 'tshirt', screen: 'GetStart', lib: FontAwesome5 },
    { name: 'person-circle-outline', screen: 'AvatarOption', lib: Ionicons },
  ];

  const nonCenterIcons = icons.filter(icon => !icon.isCenter);
  const activeIndex = nonCenterIcons.findIndex(icon => icon.screen === activeScreen);

  const indicatorPos = useRef(new Animated.Value(activeIndex !== -1 ? activeIndex * TAB_WIDTH : 0)).current;

  useEffect(() => {
    const newActiveIndex = nonCenterIcons.findIndex(icon => icon.screen === route.name);
    if (newActiveIndex !== -1) {
      setActiveScreen(route.name);
      Animated.spring(indicatorPos, {
        toValue: newActiveIndex * TAB_WIDTH,
        useNativeDriver: false, // left property is not supported by native driver
      }).start();
    }
  }, [route.name]);

  const handlePress = (screen, index) => {
    if (screen) {
      if (screen === 'Home') {
        navigation.navigate('Home'); // Always go to Home tab
      } else {
        navigation.navigate(screen);
      }
    }
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.navbar}>
        <Animated.View style={[styles.indicator, { left: indicatorPos }]} />
        {nonCenterIcons.map((icon, index) => (
          <NavButton
            key={index}
            icon={icon}
            onPress={() => handlePress(icon.screen, index)}
            isActive={activeScreen === icon.screen}
          />
        ))}
      </View>

      <Pressable onPress={() => handlePress('AddClothingScreen')} style={styles.centerButtonContainer}>
        <LinearGradient colors={['#A1887F', '#795548']} style={styles.centerButton}>
          <Ionicons name="add" size={32} color="white" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#3E2723', // Match navbar background
  },
  navbar: {
    flexDirection: 'row',
    width: '100%',
    height: 65,
    backgroundColor: '#3E2723',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  indicator: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(161, 136, 127, 0.3)',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -25,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: '#2c1d1a',
  },
});
