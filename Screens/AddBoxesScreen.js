import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddBoxesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { season, onWardrobeCreated } = route.params;
  const [boxCount, setBoxCount] = useState('3');

  const handleCreateBoxes = () => {
    navigation.navigate('ViewBoxesScreen', { 
      season: season, 
      boxCount: boxCount,
      onWardrobeCreated: onWardrobeCreated
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Wardrobe Creation</Text>
      <Text style={styles.subTitle}>{season.replace('(A)', '(Autumn)')} Wardrobe</Text>
      <Text style={styles.subTitle2}>Add Boxes</Text>

      <LinearGradient colors={['#C5A78F', '#A0785A']} style={styles.largeBox} />

      <Text style={styles.label}>How many boxes</Text>
      <TextInput
        style={styles.input}
        onChangeText={setBoxCount}
        value={boxCount}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateBoxes}
      >
        <LinearGradient
          colors={['#C5A78F', '#A0785A']}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>Create Boxes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    alignItems: 'center',
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4F4B',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 22,
    color: '#6B4F4B',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  subTitle2: {
    fontSize: 20,
    color: '#6B4F4B',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  largeBox: {
    width: '80%',
    height: 120,
    borderRadius: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    color: '#6B4F4B',
    marginBottom: 10,
  },
  input: {
    width: 80,
    height: 50,
    backgroundColor: '#C5A78F',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  createButton: {
    width: '70%',
  },
  createButtonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AddBoxesScreen;
