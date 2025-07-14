import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import BottomNav from '../../components/BottomNav';

export default function CalendarWardrobeScreen({ navigation, route }) {
  const { eventId, eventDate } = route.params;
  const [tops, setTops] = useState([]);
  const [pants, setPants] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedPant, setSelectedPant] = useState(null);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using dummy data for UI development
    const dummyTops = [
      { id: 'top1', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80' },
      { id: 'top2', imageUrl: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&q=80' },
      { id: 'top3', imageUrl: 'https://images.unsplash.com/photo-1622470953794-aa6976d07429?w=500&q=80' },
    ];
    const dummyPants = [
      { id: 'pant1', imageUrl: 'https://images.unsplash.com/photo-1602293589914-9e296ba2a7c6?w=500&q=80' },
      { id: 'pant2', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
      { id: 'pant3', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80' },
    ];
    const dummyShoes = [
      { id: 'shoe1', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
      { id: 'shoe2', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d34?w=500&q=80' },
      { id: 'shoe3', imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80' },
    ];

    setTops(dummyTops);
    setPants(dummyPants);
    setShoes(dummyShoes);
    setLoading(false);
  }, []);

  const handleSaveOutfit = () => {
    if (!selectedTop || !selectedPant || !selectedShoe) {
      Alert.alert('Incomplete Outfit', 'Please select one item from each category.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const eventRef = ref(db, `events/${user.uid}/${eventDate}/${eventId}`)

    const outfit = {
      top: selectedTop,
      pant: selectedPant,
      shoe: selectedShoe,
    };

    update(eventRef, { outfit })
      .then(() => {
        Alert.alert('Outfit Saved!', 'Your outfit has been saved for the event.');
        navigation.goBack();
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save outfit. Please try again.');
      });
  };

  const renderClothingItem = ({ item }, category, selected, setSelected) => (
    <Pressable onPress={() => setSelected(item.id)} style={[styles.itemContainer, selected === item.id && styles.selectedItem]}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      {selected === item.id && (
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={28} color="#C4704F" />
        </View>
      )}
    </Pressable>
  );

  const renderCategory = (title, data, selected, setSelected) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={(props) => renderClothingItem(props, title, selected, setSelected)}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No items in this category.</Text>}
      />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#FFFFFF" style={{ flex: 1, backgroundColor: '#2c1d1a' }} />;
  }

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Outfit</Text>
          <View style={{ width: 28 }} />
        </View>
        <FlatList
          data={[
            { title: 'Tops', data: tops, selected: selectedTop, setter: setSelectedTop },
            { title: 'Pants', data: pants, selected: selectedPant, setter: setSelectedPant },
            { title: 'Shoes', data: shoes, selected: selectedShoe, setter: setSelectedShoe },
          ]}
          renderItem={({ item }) => renderCategory(item.title, item.data, item.selected, item.setter)}
          keyExtractor={item => item.title}
          ListFooterComponent={
            <Pressable onPress={handleSaveOutfit} style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}>
              <Text style={styles.saveButtonText}>Save Outfit</Text>
            </Pressable>
          }
        />
      </LinearGradient>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 20,
    marginBottom: 15,
  },
  itemContainer: {
    width: 120,
    height: 140,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: '#C4704F',
    transform: [{ scale: 1.05 }],
  },
  itemImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 20,
  },
  saveButton: {
    backgroundColor: '#C4704F',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});