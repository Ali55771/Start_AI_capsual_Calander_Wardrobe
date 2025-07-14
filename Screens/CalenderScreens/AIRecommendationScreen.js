import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable, ActivityIndicator, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import BottomNav from '../../components/BottomNav';

const OutfitCard = ({ item, type, fadeAnim }) => (
  <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.cardOverlay} />
    <Text style={styles.cardType}>{type}</Text>
  </Animated.View>
);

export default function AIRecommendationScreen({ navigation, route }) {
  const { eventId, eventDate } = route.params;
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
    const categories = { Tops: setAllTops, Pants: setAllPants, Shoes: setAllShoes };
    let fetchedCount = 0;

    Object.keys(categories).forEach(category => {
      const wardrobeRef = ref(db, `wardrobe/${user.uid}/${category}`);
      onValue(wardrobeRef, (snapshot) => {
        const data = snapshot.val();
        const items = data ? Object.values(data) : [];
        categories[category](items);
        fetchedCount++;
        if (fetchedCount === Object.keys(categories).length) {
          setLoading(false);
        }
      }, { onlyOnce: true });
    });
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

  const handleSaveOutfit = () => {
    if (!recommendedOutfit) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const eventRef = ref(db, `events/${user.uid}/${eventDate}/${eventId}`);

    update(eventRef, { outfit: recommendedOutfit })
      .then(() => {
        Alert.alert('Outfit Saved!', 'The recommended outfit has been saved for your event.');
        navigation.goBack();
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save outfit. Please try again.');
      });
  };

  if (loading) {
    return <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.center}><ActivityIndicator size="large" color="#FFFFFF" /></LinearGradient>;
  }

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Recommendation</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.content}>
          {generating ? (
            <View style={styles.center}><ActivityIndicator size="large" color="#C4704F" /><Text style={styles.generatingText}>AI is thinking...</Text></View>
          ) : recommendedOutfit ? (
            <View style={styles.outfitContainer}>
              <OutfitCard item={recommendedOutfit.top} type="Top" fadeAnim={fadeAnim} />
              <OutfitCard item={recommendedOutfit.pant} type="Pant" fadeAnim={fadeAnim} />
              <OutfitCard item={recommendedOutfit.shoe} type="Shoe" fadeAnim={fadeAnim} />
            </View>
          ) : (
            <View style={styles.center}><Text style={styles.generatingText}>No items to recommend.</Text></View>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable onPress={generateRecommendation} disabled={generating} style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.buttonPressed, generating && styles.disabledButton]}>
            <Ionicons name="refresh" size={22} color="#C4704F" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Try Again</Text>
          </Pressable>
          <Pressable onPress={handleSaveOutfit} disabled={generating || !recommendedOutfit} style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.buttonPressed, (generating || !recommendedOutfit) && styles.disabledButton]}>
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            <Text style={styles.buttonText}>Save Outfit</Text>
          </Pressable>
        </View>
      </LinearGradient>
      <BottomNav />
    </View>
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
  generatingText: { color: '#FFFFFF', marginTop: 15, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 15, width: '45%' },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  primaryButton: { backgroundColor: '#C4704F' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#C4704F' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  secondaryButtonText: { color: '#C4704F' },
  disabledButton: { opacity: 0.5 },
});