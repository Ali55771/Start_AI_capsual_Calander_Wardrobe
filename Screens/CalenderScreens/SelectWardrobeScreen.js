import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { UserContext } from '../../context/UserContext'; // Adjust this import path if needed
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';

const SelectWardrobeScreen = ({ route }) => {
  const db = getFirestore();
  const { event } = route.params;
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [wardrobes, setWardrobes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWardrobes = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, 'wardrobes'),
          where('userId', '==', user.uid),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const userWardrobes = await Promise.all(
          querySnapshot.docs.map(async (wardrobeDoc) => {
            const wardrobeData = { id: wardrobeDoc.id, ...wardrobeDoc.data() };
            // A wardrobe has a 'labels' field which contains the names of the boxes (as strings)
            const boxNames = wardrobeData.labels || [];
            const allItems = [];

            // We need to query the 'items' subcollection and filter by box name
            const itemsRef = collection(db, 'wardrobes', wardrobeDoc.id, 'items');
            const itemsQuery = query(itemsRef, where('selectedBox', 'in', boxNames.length > 0 ? boxNames : [' ']));
            const itemsSnapshot = await getDocs(itemsQuery);
            
            const wardrobeItems = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }));
            allItems.push(...wardrobeItems);

            wardrobeData.items = allItems;
            return wardrobeData;
          })
        );
        setWardrobes(userWardrobes);
      } catch (error) {
        console.error("Error fetching active wardrobes: ", error);
        alert('Failed to load wardrobes.');
      } finally {
        setLoading(false);
      }
    };

    fetchWardrobes();
  }, [user]);

  const handleSelectWardrobe = (wardrobe) => {
    navigation.navigate('SelectItemsScreen', { wardrobe: wardrobe, event: event });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#A0785A" style={styles.loader} />;
  }

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#F5EADD' }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#A0785A" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Your Wardrobe</Text>
        {wardrobes.length > 0 ? (
          <FlatList
            data={wardrobes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.wardrobeButton}
                onPress={() => handleSelectWardrobe(item)}
              >
                <Text style={styles.wardrobeText}>{item.season.replace('(A)', '(Autumn)')} Wardrobe</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No active wardrobes found.</Text>
        )}
      </View>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4F4B',
    textAlign: 'center',
    marginBottom: 30,
  },
  wardrobeButton: {
    backgroundColor: '#C5A78F',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  wardrobeText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B4F4B',
    marginTop: 50,
  },
});

export default SelectWardrobeScreen;
