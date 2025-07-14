import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
import BottomNav from '../components/BottomNav';

const WardrobeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const items = [
    { id: '1', category: 'Tops', name: 'Black T-shirt',  },
    { id: '2', category: 'Bottoms', name: 'Blue Jeans',  },
    { id: '3', category: 'Bottoms', name: 'Brown Dress',},
    { id: '4', category: 'Tops', name: 'White Shirt',  },
  ];

  const filteredItems = items.filter(item => selectedCategory === 'All' || item.category === selectedCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wardrobe</Text>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setSelectedCategory('All')} style={[styles.tab, selectedCategory === 'All' && styles.activeTab]}>
            <Text style={styles.tabText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('Tops')} style={[styles.tab, selectedCategory === 'Tops' && styles.activeTab]}>
            <Text style={styles.tabText}>Tops</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('Bottoms')} style={[styles.tab, selectedCategory === 'Bottoms' && styles.activeTab]}>
            <Text style={styles.tabText}>Bottoms</Text>
          </TouchableOpacity>
        </View>
      </View>
    

      <ScrollView style={styles.content}>
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF7F50',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tab: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#FF6347',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    padding: 20,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  itemName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#FF6347',
    padding: 5,
    borderRadius: 5,
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { 
    color: '#fff',
    fontSize: 30,
  },
});

export default WardrobeScreen;