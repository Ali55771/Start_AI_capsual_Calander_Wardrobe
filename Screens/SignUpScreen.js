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
  Dimensions,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Firebase Sign-Up Logic (preserved) ---
  const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim() || !gender) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields.' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: name,
        gender: gender,
        email: email.toLowerCase(),
        createdAt: new Date(),
        profileImage: `https://ui-avatars.com/api/?name=${name.charAt(0)}&background=random&color=fff`,
      });

      await sendEmailVerification(user);
      Toast.show({ 
        type: 'success', 
        text1: 'Confirmation Email Sent',
        text2: 'We have sent a confirmation link to your email. Please check it.',
        visibilityTime: 4000
      });
      // Delay navigation to allow the user to read the toast message
      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, 2500);
    } catch (error) {
      const message = error.code.includes('auth/email-already-in-use')
        ? 'This email is already registered.'
        : 'An error occurred. Please try again.';
      Toast.show({ type: 'error', text1: 'Sign Up Failed', text2: message });
    }
  };
  // --- End of logic section ---

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const inputAnim1 = useRef(new Animated.Value(0)).current;
  const inputAnim2 = useRef(new Animated.Value(0)).current;
  const inputAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(inputAnim1, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(inputAnim2, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(inputAnim3, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  // Button press animations
  const onPressIn = () => Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const createAnimatedStyle = (anim) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>

        <Animated.View style={createAnimatedStyle(titleAnim)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our stylish community</Text>
        </Animated.View>

                <Animated.View style={[styles.inputContainer, createAnimatedStyle(inputAnim1)]}>
          <Ionicons name="person-outline" size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, createAnimatedStyle(inputAnim2)]}>
          <Ionicons name="male-female-outline" size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'Male' && styles.genderOptionSelected]}
              onPress={() => setGender('Male')}
            >
              <Text style={[styles.genderText, gender === 'Male' && styles.genderTextSelected]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'Female' && styles.genderOptionSelected]}
              onPress={() => setGender('Female')}
            >
              <Text style={[styles.genderText, gender === 'Female' && styles.genderTextSelected]}>Female</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputContainer, createAnimatedStyle(inputAnim2)]}>
          <Ionicons name="mail-outline" size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, createAnimatedStyle(inputAnim3)]}>
          <Ionicons name="lock-closed-outline" size={22} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Animated.View>

        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleSignUp}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', marginBottom: 40 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, width: '100%' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 55, color: '#FFFFFF', fontSize: 16 },
  button: { width: Dimensions.get('window').width - 50, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', marginTop: 30, alignItems: 'center' },
  loginText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16 },
  linkText: { color: '#C4704F', textDecorationLine: 'underline', fontSize: 16, fontWeight: 'bold' },
  genderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  genderOption: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
  },
  genderOptionSelected: {
    backgroundColor: '#C4704F',
    borderColor: '#C4704F',
  },
  genderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
