import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';


const WardrobePreviewScreen = () => {
  const navigation = useNavigation();
  

    return (
    <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>
      <View style={styles.header}>
        <TouchableOpacity style={styles.titleContainer} activeOpacity={0.8}>
          <Text style={styles.title}>Wardrobe</Text>
        </TouchableOpacity>
      </View>

            <View style={styles.wardrobeContainer}>
        <Image
          source={{ uri: 'https://img.freepik.com/premium-photo/trying-virtual-clothes-virtual-closet-virtual-shop-shopping-futuristic-technology-tech-digital_984314-386.jpg' }}
          style={styles.wardrobeImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, {marginBottom: 90}]}
        onPress={() => navigation.navigate('WardrobeOptionsScreen')}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
      <BottomNav />
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10, // Ensure it's above other elements
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: '#A0785A',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wardrobeContainer: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  wardrobeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 200, // Add a curve to the image
  },
  nextButton: {
    backgroundColor: '#A0785A',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default WardrobePreviewScreen;
