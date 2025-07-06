 import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

const OutfitCarousel = () => {
  const outfits = [
    { uri: 'https://via.placeholder.com/150' },
    { uri: 'https://via.placeholder.com/150' },
    { uri: 'https://via.placeholder.com/150' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>What are you wearing today?</Text>
      <Text style={styles.title}>Recommended Outfits</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {outfits.map((outfit, index) => ( 
          <View key={index} style={styles.outfitCard}>
            <Image source={{ uri: outfit.uri }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity> 
        <Text style={styles.viewAll}>View all</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  appTitle: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 15,
  },
  carousel: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
  },
  image: {
    width: 90,
    height: 110,
    borderRadius: 8,
  },
  viewAll: {
    color: '#4A148C',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});

export default OutfitCarousel;
