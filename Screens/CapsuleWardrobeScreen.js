import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const CapsuleWardrobeScreen = () => {
  const navigation = useNavigation();
  const { user, db } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [groupedByBox, setGroupedByBox] = useState({});
  const [selectedItems, setSelectedItems] = useState({}); // { boxName: Set(itemId) }

  useEffect(() => {
    if (user && db) {
      fetchAllWardrobeItems();
    }
  }, [user, db]);

  const fetchAllWardrobeItems = async () => {
    setLoading(true);
    try {
      const wardrobeQuery = query(collection(db, 'wardrobes'), where('userId', '==', user.uid));
      const wardrobesSnapshot = await getDocs(wardrobeQuery);
      let allItems = [];
      for (const wardrobeDoc of wardrobesSnapshot.docs) {
        const wardrobeId = wardrobeDoc.id;
        const itemsQuery = collection(db, 'wardrobes', wardrobeId, 'items');
        const itemsSnapshot = await getDocs(itemsQuery);
        itemsSnapshot.forEach(itemDoc => {
          allItems.push({
            ...itemDoc.data(),
            id: itemDoc.id,
            wardrobeId,
            wardrobeName: wardrobeDoc.data().wardrobeName || '',
          });
        });
      }
      // Group by selectedBox
      const grouped = allItems.reduce((acc, item) => {
        const box = item.selectedBox || 'Uncategorized';
        if (!acc[box]) acc[box] = [];
        acc[box].push(item);
        return acc;
      }, {});
      setGroupedByBox(grouped);
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Multi-select logic
  const toggleSelect = (box, itemId) => {
    setSelectedItems(prev => {
      const boxSet = new Set(prev[box] || []);
      if (boxSet.has(itemId)) {
        boxSet.delete(itemId);
      } else {
        boxSet.add(itemId);
      }
      return { ...prev, [box]: boxSet };
    });
  };

  // Prepare selected items for combination generation
  const getSelectedItemsByBox = () => {
    const result = {};
    Object.keys(selectedItems).forEach(box => {
      if (selectedItems[box] && selectedItems[box].size > 0) {
        result[box] = (groupedByBox[box] || []).filter(item => selectedItems[box].has(item.id));
      }
    });
    return result;
  };

  // Button enabled if at least 2 boxes have 1+ selected items
  const canGenerate = Object.values(selectedItems).filter(set => set && set.size > 0).length >= 2;

  const handleGenerateCombinations = () => {
    const selected = getSelectedItemsByBox();
    navigation.navigate('CapsuleCombinationsScreen', { selected });
  };

  const renderItem = ({ item, box }) => {
    const isSelected = selectedItems[box]?.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        onPress={() => toggleSelect(box, item.id)}
        activeOpacity={0.8}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : null}
        <View style={styles.itemInfoBox}>
          <Text style={styles.itemLabel}><Text style={styles.itemLabelBold}>Type:</Text> {item.clothingType || item.outfitType || '-'}</Text>
          <Text style={styles.itemLabel}><Text style={styles.itemLabelBold}>Color:</Text> {item.Colour || '-'}</Text>
          <Text style={styles.itemLabel}><Text style={styles.itemLabelBold}>Material:</Text> {item.stuff || '-'}</Text>
          {item.Detail ? <Text style={styles.itemLabel}><Text style={styles.itemLabelBold}>Details:</Text> {item.Detail}</Text> : null}
        </View>
        <View style={[styles.selectCircle, isSelected && styles.selectCircleSelected]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Your Capsule Wardrobe</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
          ) : Object.keys(groupedByBox).length === 0 ? (
            <Text style={styles.placeholder}>No wardrobe items found.</Text>
          ) : (
            Object.keys(groupedByBox).map((box) => (
              <View key={box} style={styles.boxSection}>
                <Text style={styles.boxTitle}>{box}</Text>
                <FlatList
                  data={groupedByBox[box]}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => renderItem({ item, box })}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  extraData={selectedItems[box]}
                />
              </View>
            ))
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.generateButton, !canGenerate && { opacity: 0.5 }]}
              onPress={handleGenerateCombinations}
              disabled={!canGenerate}
            >
              <Text style={styles.generateButtonText}>Generate Combinations</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  boxSection: {
    marginBottom: 32,
  },
  boxTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C4704F',
    marginBottom: 12,
    marginLeft: 4,
  },
  itemCard: {
    backgroundColor: '#23422d',
    borderRadius: 12,
    marginRight: 16,
    padding: 12,
    width: 170,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  itemInfoBox: {
    width: '100%',
  },
  itemLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  itemLabelBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  itemCardSelected: {
    borderColor: '#C4704F',
    borderWidth: 2,
    backgroundColor: '#3FA46A33',
  },
  selectCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#C4704F',
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleSelected: {
    backgroundColor: '#C4704F',
    borderColor: '#fff',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  generateButton: {
    backgroundColor: '#C4704F',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CapsuleWardrobeScreen; 