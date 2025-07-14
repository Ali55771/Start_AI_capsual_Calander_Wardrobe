import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Pressable, Platform, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const IntroScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#5D4037']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#EFEBE9" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <MaterialCommunityIcons name="robot-love-outline" size={100} color="#D7CCC8" />
          </Animated.View>

          <Animated.Text style={[styles.title, animatedStyle]}>AI Recommendation</Animated.Text>
          <Animated.Text style={[styles.description, animatedStyle]}>
            Discover the perfect look for every day and any occasion with personalized suggestions.
          </Animated.Text>

          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => navigation.navigate('MainScreen')}
          >
            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#D7CCC8', '#BCAAA4']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={22} color="#3E2723" style={{ marginLeft: 10 }} />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EFEBE9',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 18,
    color: '#A1887F',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 26,
  },
  buttonContainer: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonText: {
    color: '#3E2723',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IntroScreen;