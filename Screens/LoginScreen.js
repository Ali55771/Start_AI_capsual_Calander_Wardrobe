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
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useContext } from 'react';

// A reusable animated text input component for a slick UI
const AnimatedTextInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation for each input field
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  // Animate opacity and position
  const animatedStyle = {
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
    }],
  };

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Ionicons name={icon} size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={placeholder === 'Email' ? 'email-address' : 'default'}
        autoCapitalize="none"
      />
    </Animated.View>
  );
};


const LoginScreen = () => {
  const { setUser } = useContext(UserContext);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Firebase Login Logic ---
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Login Error', text2: 'Please enter both email and password.' });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

            if (user.emailVerified) {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUser({ uid: user.uid, ...docSnap.data() });
        }
        
        navigation.replace('HomeScreen');
      } else {
        // Inform the user that they need to verify their email
        Toast.show({
          type: 'info',
          text1: 'Verification Required',
          text2: 'Please check your email and verify your account before logging in.',
          visibilityTime: 4000,
        });
        // Optionally, you can offer to resend the verification email here
      }
    } catch (error) {
      console.error("Firebase Login Error: ", JSON.stringify(error, null, 2));
      let message = 'An unknown error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      }
      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
    }
  };
  // --- End of logic section ---


  // Animation for the login button press (hover effect)
  const buttonScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  // Animation for the title
  const titleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [titleAnim]);
  
  const titleStyle = {
    opacity: titleAnim,
    transform: [{ scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.Text style={[styles.title, titleStyle]}>Welcome Back</Animated.Text>
        <Animated.Text style={[styles.subtitle, titleStyle]}>Sign in to your account</Animated.Text>

        <AnimatedTextInput
          icon="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          delay={200} // Staggered animation
        />
        <AnimatedTextInput
          icon="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          delay={300} // Staggered animation
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')} style={styles.forgotPassword}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleLogin}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.button} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  linkText: {
    color: '#C4704F',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;