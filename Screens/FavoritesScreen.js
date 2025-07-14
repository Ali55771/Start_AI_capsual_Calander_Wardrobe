import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { useNavigation } from 'expo-router';
import BottomNav from '../components/BottomNav';


const FavoriteOutfitCard = ({ outfit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.imagesContainer}>
      <Image source={{ uri: outfit.top.imageUrl }} style={styles.cardImage} />
      <Image source={{ uri: outfit.pant.imageUrl }} style={styles.cardImage} />
      <Image source={{ uri: outfit.shoe.imageUrl }} style={styles.cardImage} />
    </View>
    <View style={styles.cardFooter}>
        <View style={styles.detailsContainer}>
            <Text style={styles.cardTitle}>Saved Outfit</Text>
            <Text style={styles.cardSubtitle}>{`For: ${outfit.recommendedFor.event || 'Any Occasion'}`}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(outfit.id)} style={styles.deleteButton}>
            <Ionicons name="trash-bin" size={24} color="#C4704F" />
        </TouchableOpacity>
    </View>
  </View>
);

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const favoritesRef = ref(db, `favorites/${user.uid}`);

    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedFavorites = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setFavorites(loadedFavorites.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (favoriteId) => {
    Alert.alert(
      "Delete Outfit",
      "Are you sure you want to delete this outfit from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
              const db = getDatabase();
              remove(ref(db, `favorites/${user.uid}/${favoriteId}`));
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.center}><ActivityIndicator size="large" color="#FFFFFF" /></LinearGradient>;
  }

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorite Outfits</Text>
        <View style={{ width: 28 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={80} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No Favorites Yet</Text>
          <Text style={styles.emptySubText}>Start saving outfits from the AI recommender!</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FavoriteOutfitCard outfit={item} onDelete={handleDelete} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  listContainer: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
  imagesContainer: { flexDirection: 'row' },
  cardImage: { width: '33.33%', height: 130, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)' },
  detailsContainer: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  deleteButton: { padding: 8, marginLeft: 10 },
  emptyText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  emptySubText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', marginTop: 10 },



});

