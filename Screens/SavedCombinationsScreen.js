import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import BottomNav from '../components/BottomNav';

const SavedCombinationsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [combinations, setCombinations] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    const savedRef = ref(db, `savedCombinations/${user.uid}`);
    const unsubscribe = onValue(savedRef, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setCombinations(loaded.reverse());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    remove(ref(db, `savedCombinations/${user.uid}/${id}`));
  };

  const renderCombo = ({ item, index }) => (
    <View style={styles.comboCard}>
      <Text style={styles.comboTitle}>Combination #{combinations.length - index}</Text>
      <View style={styles.comboRow}>
        {item.combo.map((piece, idx) => (
          <View key={piece.id || idx} style={styles.pieceCard}>
            {piece.imageUrl ? (
              <Image source={{ uri: piece.imageUrl }} style={styles.pieceImage} />
            ) : null}
            <Text style={styles.pieceType}>{piece.clothingType || piece.outfitType || '-'}</Text>
            <Text style={styles.pieceColor}>{piece.Colour || '-'}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash" size={20} color="#fff" />
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Saved Combinations</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
        ) : combinations.length === 0 ? (
          <Text style={styles.placeholder}>No saved combinations found.</Text>
        ) : (
          <FlatList
            data={combinations}
            keyExtractor={item => item.id}
            renderItem={renderCombo}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </SafeAreaView>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c1d1a',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  comboCard: {
    backgroundColor: '#23422d',
    borderRadius: 12,
    marginBottom: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#3FA46A',
  },
  comboTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  comboRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pieceCard: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pieceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  pieceType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieceColor: {
    color: '#fff',
    fontSize: 13,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c62839',
    borderRadius: 8,
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default SavedCombinationsScreen; 