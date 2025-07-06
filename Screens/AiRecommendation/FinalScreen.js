import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FinalScreen = ({ route, navigation }) => {
  const { outfit } = route.params || {
    jacket: 'https://via.placeholder.com/300x400.png?text=Shirt+1',
    pant: 'https://via.placeholder.com/300x400.png?text=Pant+1',
    shoe: 'https://via.placeholder.com/300x200.png?text=Shoe+1'
  };

  const handleSave = () => {
    Alert.alert(
      "Success",
      "Your final selection has been saved successfully.",
      [{ text: "OK", onPress: () => navigation.navigate('IntroScreen') }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Your Final Selection</Text>

      <View style={styles.outfitContainer}>
        <Image 
          source={{ uri: outfit.jacket }} 
          style={styles.jacketImage} 
          resizeMode="cover"
        />
        <View style={styles.bottomRow}>
          <Image 
            source={{ uri: outfit.pant }} 
            style={styles.pantImage} 
            resizeMode="cover"
          />
          <Image 
            source={{ uri: outfit.shoe }} 
            style={styles.shoeImage} 
            resizeMode="cover"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
        <Ionicons name="heart" size={20} color="red" style={styles.heartIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E1CE',
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#CC7C39',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#C27C2C',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 30,
  },
  outfitContainer: {
    backgroundColor: '#C27C2C',
    borderRadius: 15,
    padding: 15,
    width: '85%',
    marginVertical: 30,
    alignItems: 'center',
  },
  jacketImage: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  pantImage: {
    width: '45%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  shoeImage: {
    width: '45%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#C27C2C',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  heartIcon: {
    marginLeft: 5,
  },
});

export default FinalScreen; 