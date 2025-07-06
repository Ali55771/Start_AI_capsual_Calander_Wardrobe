import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CreatedWardrobesScreen = () => {
  const navigation = useNavigation();

  // Dummy data for wardrobes
  const wardrobes = ['Summer Wardrobe', 'Winter Wardrobe'];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Your Created Wardrobes</Text>

      <ScrollView contentContainerStyle={styles.wardrobeList}>
        {wardrobes.map((wardrobe, index) => (
          <TouchableOpacity
            key={index}
            style={styles.wardrobeButton}
            onPress={() => alert(`${wardrobe} opened!`)}
          >
            <Text style={styles.wardrobeButtonText}>{wardrobe}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
    marginBottom: 30,
  },
  wardrobeList: {
    alignItems: 'center',
  },
  wardrobeButton: {
    backgroundColor: '#C5A78F',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginVertical: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  wardrobeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default CreatedWardrobesScreen;
