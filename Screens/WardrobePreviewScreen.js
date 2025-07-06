import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const WardrobePreviewScreen = () => {
  const navigation = useNavigation();
  

    return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>
      <View style={styles.header}>
        <TouchableOpacity style={styles.titleContainer}>
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
        style={styles.nextButton}
        onPress={() => navigation.navigate('WardrobeOptionsScreen')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
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
