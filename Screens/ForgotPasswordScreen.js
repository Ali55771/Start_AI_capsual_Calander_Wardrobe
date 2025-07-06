import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  // --- Firebase Password Reset Logic --- 
  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your email address.' });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({ 
        type: 'success', 
        text1: 'Email Sent',
        text2: 'Password reset link sent! Please check your inbox.' 
      });
      // Navigate back to login screen after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 2500);
    } catch (error) {
      console.error("Firebase Password Reset Error: ", JSON.stringify(error, null, 2));
      const message = error.code.includes('auth/user-not-found')
        ? 'This email is not registered with an account.'
        : 'An error occurred. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    }
  };
  // --- End of logic section ---

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleAnim, inputAnim]);

  // Button press animations
  const onPressIn = () => Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  // Component styles from animations
  const titleStyle = {
    opacity: titleAnim,
    transform: [{
      translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
    }],
  };
  const inputStyle = {
    opacity: inputAnim,
    transform: [{
      translateY: inputAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
    }],
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>

        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
        </Animated.View>

        <Animated.View style={[styles.inputContainer, inputStyle]}>
          <Ionicons name="mail-outline" size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Your Email Address"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Animated.View>

        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handlePasswordReset}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.button} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    width: Dimensions.get('window').width - 50,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;