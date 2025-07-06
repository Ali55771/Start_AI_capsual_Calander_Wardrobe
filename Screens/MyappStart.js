import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const MyappStart = () => {
  const navigation = useNavigation();
  // Animation values
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login screen after a delay
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen'); // Use replace to prevent going back to splash
    }, 7000); // 3.5 seconds delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation, logoScaleAnim, logoOpacityAnim, textOpacityAnim]);

  return (
    <LinearGradient colors={['#3E2723', '#6D4C41']} style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacityAnim, transform: [{ scale: logoScaleAnim }] }]}>
        <Text style={styles.logoText}>G</Text>
      </Animated.View>
      <Animated.View style={{ opacity: textOpacityAnim }}>
        <Text style={styles.appName}>Groomify</Text>
        <Text style={styles.tagline}>Your Digital Wardrobe</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4E342E', // Fallback color
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'serif', // A more elegant font
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#D7CCC8',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
});

export default MyappStart;