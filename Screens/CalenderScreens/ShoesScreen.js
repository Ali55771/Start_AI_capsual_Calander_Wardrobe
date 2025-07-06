import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function ShoesScreen({ navigation }) {
  const shoes = [
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
    'https://cdn-icons-png.flaticon.com/512/2742/2742674.png',
  ];

  return (
    <ImageBackground 
      source={{ uri: 'https://img.freepik.com/free-photo/white-concrete-wall_53876-92803.jpg' }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Wardrobe</Text>
      </View>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Shoes</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {shoes.map((shoe, index) => (
            <View key={index} style={styles.itemContainer}>
              <Image source={{ uri: shoe }} style={styles.itemImage} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryHeader: {
    backgroundColor: '#C4704F',
    padding: 15,
    margin: 10,
    borderRadius: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  itemContainer: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#C4704F',
    borderRadius: 15,
    marginBottom: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
});