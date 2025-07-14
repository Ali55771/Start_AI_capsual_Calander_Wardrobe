import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const WardrobeOptionsScreen = () => {
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={28} color="#A0785A" />
        </TouchableOpacity>
        <Text style={styles.topText}>What do you want to do now?</Text>
        <LinearGradient
          colors={['#C5A78F', '#A0785A']}
          style={styles.gradientContainer}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('WardrobeCreationScreen', { from: 'create' })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Wardrobe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('WardrobeCreationScreen', { from: 'open' })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Open Wardrobe</Text>
          </TouchableOpacity>
        </LinearGradient>
        <BottomNav />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  }, 
  topText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6B4F4B',
    textAlign: 'center',
    marginBottom: 30,
  },
  gradientContainer: {
    width: '90%',
    height: '50%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: '#F5EADD',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginVertical: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#6B4F4B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WardrobeOptionsScreen;
