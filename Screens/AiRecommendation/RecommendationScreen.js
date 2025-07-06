import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable, ActivityIndicator, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const OutfitCard = ({ item, type, fadeAnim }) => (
  <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.cardOverlay} />
    <Text style={styles.cardType}>{type}</Text>
  </Animated.View>
);

export default function RecommendationScreen({ navigation, route }) {
  const { city, event, dressType, weather } = route.params;
  const [allTops, setAllTops] = useState([]);
  const [allPants, setAllPants] = useState([]);
  const [allShoes, setAllShoes] = useState([]);
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    const db = getDatabase();

    const seedAndSetState = () => {
      const dummyData = {
        Tops: [
          { imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80', name: 'Stylish Tee' },
          { imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80', name: 'Classic Black' },
          { imageUrl: 'https://images.unsplash.com/photo-1622470953794-34503b4ab8a9?w=500&q=80', name: 'Casual Shirt' }
        ],
        Pants: [
          { imageUrl: 'https://images.unsplash.com/photo-1602293589914-9e296ba2a7c4?w=500&q=80', name: 'Denim Jeans' },
          { imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80', name: 'Khaki Trousers' },
          { imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80', name: 'Slim-fit Pants' }
        ],
        Shoes: [
          { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?w=500&q=80', name: 'Running Shoes' },
          { imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80', name: 'Leather Boots' },
          { imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80', name: 'White Sneakers' }
        ]
      };

      Object.keys(dummyData).forEach(category => {
        dummyData[category].forEach(item => {
          push(ref(db, `wardrobe/${user.uid}/${category}`), item);
        });
      });

      setAllTops(dummyData.Tops);
      setAllPants(dummyData.Pants);
      setAllShoes(dummyData.Shoes);
      Alert.alert("Welcome!", "We've added some sample items to your wardrobe to get you started.");
      setLoading(false);
    };

    const fetchWardrobe = () => {
      const categories = { Tops: setAllTops, Pants: setAllPants, Shoes: setAllShoes };
      let fetchedCount = 0;
      Object.keys(categories).forEach(category => {
        const wardrobeRef = ref(db, `wardrobe/${user.uid}/${category}`);
        onValue(wardrobeRef, (snapshot) => {
          const data = snapshot.val();
          categories[category](data ? Object.values(data) : []);
          fetchedCount++;
          if (fetchedCount === Object.keys(categories).length) {
            setLoading(false);
          }
        }, { onlyOnce: true });
      });
    };

    onValue(ref(db, `wardrobe/${user.uid}`), (snapshot) => {
      if (snapshot.exists()) {
        fetchWardrobe();
      } else {
        seedAndSetState();
      }
    }, { onlyOnce: true });
  }, []);

  useEffect(() => {
    if (!loading) {
      generateRecommendation();
    }
  }, [loading]);

  const generateRecommendation = () => {
    if (allTops.length === 0 || allPants.length === 0 || allShoes.length === 0) {
      Alert.alert("Not Enough Clothes", "Please add at least one item to each category (Tops, Pants, Shoes) to get a recommendation.");
      return;
    }

    setGenerating(true);
    fadeAnim.setValue(0);

    setTimeout(() => {
      const top = allTops[Math.floor(Math.random() * allTops.length)];
      const pant = allPants[Math.floor(Math.random() * allPants.length)];
      const shoe = allShoes[Math.floor(Math.random() * allShoes.length)];
      setRecommendedOutfit({ top, pant, shoe });
      setGenerating(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1000);
  };

  const handleSaveToFavorites = () => {
    if (!recommendedOutfit) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const favoritesRef = ref(db, `favorites/${user.uid}`);
    
    push(favoritesRef, { ...recommendedOutfit, recommendedFor: { city, event, dressType, weather } })
      .then(() => {
        Alert.alert('Saved!', 'This outfit has been saved to your favorites.');
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save outfit. Please try again.');
      });
  };

  if (loading) {
    return <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.center}><ActivityIndicator size="large" color="#FFFFFF" /><Text style={styles.loadingText}>Loading your wardrobe...</Text></LinearGradient>;
  }

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Perfect Outfit</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {generating ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#C4704F" /><Text style={styles.generatingText}>Generating your perfect outfit...</Text></View>
        ) : recommendedOutfit ? (
          <View style={styles.outfitContainer}>
            <OutfitCard item={recommendedOutfit.top} type="Top" fadeAnim={fadeAnim} />
            <OutfitCard item={recommendedOutfit.pant} type="Pant" fadeAnim={fadeAnim} />
            <OutfitCard item={recommendedOutfit.shoe} type="Shoe" fadeAnim={fadeAnim} />
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.generatingText}>No items in wardrobe to recommend.</Text>
            <Pressable onPress={() => navigation.navigate('AddClothing')} style={({ pressed }) => [styles.button, styles.primaryButton, {marginTop: 20}, pressed && styles.buttonPressed]}>
                <Text style={styles.buttonText}>Add Clothes</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={generateRecommendation} disabled={generating} style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.buttonPressed, generating && styles.disabledButton]}>
          <Ionicons name="refresh" size={22} color="#C4704F" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Try Again</Text>
        </Pressable>
        <Pressable onPress={handleSaveToFavorites} disabled={generating || !recommendedOutfit} style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.buttonPressed, (generating || !recommendedOutfit) && styles.disabledButton]}>
          <Ionicons name="heart" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Save to Favorites</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  outfitContainer: { alignItems: 'center', justifyContent: 'space-around', height: '85%' },
  card: { width: '90%', height: '28%', borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
  cardImage: { position: 'absolute', width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.2)' },
  cardType: { color: 'white', fontSize: 24, fontWeight: 'bold', padding: 15, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  loadingText: { color: '#FFFFFF', marginTop: 15, fontSize: 16 },
  generatingText: { color: '#FFFFFF', marginTop: 15, fontSize: 16, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 15, width: '48%' },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  primaryButton: { backgroundColor: '#C4704F' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#C4704F' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  secondaryButtonText: { color: '#C4704F' },
  disabledButton: { opacity: 0.5 },
});