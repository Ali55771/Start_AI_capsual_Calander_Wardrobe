import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GetStartScreen = ({ navigation }) => {
  // Animation values
  const imageAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Animated value for back button
  const backArrowScale = useRef(new Animated.Value(1)).current;

  // For web hover effect on button
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    // Staggered entrance animation
    Animated.stagger(200, [
      Animated.timing(imageAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Interpolated styles for animations
  const imageStyles = { opacity: imageAnim, transform: [{ scale: imageAnim }] };
  const titleStyles = { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] };
  const subtitleStyles = { opacity: subtitleAnim, transform: [{ translateY: subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] };
  const buttonStyles = { opacity: buttonAnim, transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] };

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <LinearGradient
      // Updated gradient to match app's warm brown/cream color scheme
      colors={['#EACDA3', '#D6AE7B', '#9B673E']}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Back Arrow with press animation and shadow, brown color */}
      <Animated.View style={{ transform: [{ scale: backArrowScale }], ...styles.backButtonShadow }}>
        <Pressable
          onPressIn={() => Animated.spring(backArrowScale, { toValue: 0.85, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(backArrowScale, { toValue: 1, useNativeDriver: true }).start()}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#9B673E" />
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        {/* Professional Wardrobe Illustration */}
        <Animated.Image
          source={{ uri: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80' }}
          style={[styles.illustration, imageStyles, { borderRadius: 30, shadowColor: '#9B673E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 10 }]}
          resizeMode="cover"
        />
        {/* Animated Heading with scale and fade */}
        <Animated.Text style={[styles.title, titleStyles, { letterSpacing: 1.2 }]}>Style Your Story</Animated.Text>
        {/* Animated Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyles]}>Your personal wardrobe assistant awaits. Let's get you started.</Animated.Text>
      </View>

      {/* Glassmorphism Button with animated press/hover */}
      <Animated.View style={[styles.buttonContainer, buttonStyles]}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => navigation.navigate('WardrobePreviewScreen')}
          {...(Platform.OS === 'web' ? {
            onHoverIn: () => setIsHovered(true),
            onHoverOut: () => setIsHovered(false),
          } : {})}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient
              colors={isHovered ? ['#EACDA3', '#9B673E'] : ['rgba(255,255,255,0.92)', 'rgba(234,205,163,0.85)']}
              style={[styles.button, isHovered && Platform.OS === 'web' ? styles.buttonHover : null]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.buttonText, isHovered && Platform.OS === 'web' ? styles.buttonTextHover : null]}>Let's Go</Text>
              <Ionicons name="arrow-forward-circle" size={24} color={isHovered && Platform.OS === 'web' ? '#fff' : '#9B673E'} style={{ marginLeft: 10, transition: 'color 0.2s' }} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
  },
  illustration: {
    width: 260,
    height: 260,
    marginBottom: 18,
    borderRadius: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#5E3A1D',
    textAlign: 'center',
    textShadowColor: 'rgba(155, 103, 62, 0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 19,
    color: '#9B673E',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: '#9B673E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(234,205,163,0.7)',
    // Glassmorphism
    backgroundColor: 'rgba(255,255,255,0.25)',
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s' } : {}),
  },
  buttonHover: {
    backgroundColor: 'rgba(155,103,62,0.92)',
    borderColor: '#EACDA3',
    shadowColor: '#EACDA3',
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 20,
  },
  buttonText: {
    fontSize: 22,
    color: '#9B673E',
    fontWeight: 'bold',
    letterSpacing: 1.1,
    ...(Platform.OS === 'web' ? { transition: 'color 0.2s' } : {}),
  },
  buttonTextHover: {
    color: '#fff',
  },
  backButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 50,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    marginTop: 40,
    marginLeft: 10,
  },
});

export default GetStartScreen;
