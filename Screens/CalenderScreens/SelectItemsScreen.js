import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Image, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import BottomNav from '../../components/BottomNav';

const SelectItemsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { wardrobe, event } = route.params;
  const fetchedItems = wardrobe?.items || [];

  const [sections, setSections] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processItems = () => {
      if (fetchedItems.length > 0) {
        // Group items by clothingType (box name)
        const grouped = fetchedItems.reduce((acc, item) => {
          const category = item.clothingType || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});

        // Get all unique categories dynamically
        const allCategories = Object.keys(grouped);
        const formattedSections = allCategories.map(category => ({
          title: category,
          data: [grouped[category]],
        }));

        setSections(formattedSections);
      } else {
        setSections([]);
      }
      setLoading(false);
    };

    processItems();
  }, [wardrobe]);

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleDone = async () => {
    if (!event?.id) {
      Alert.alert('Error', 'Event ID not found.');
      return;
    }
    try {
      const db = getFirestore();
      const eventRef = doc(db, 'events', event.id);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        await updateDoc(eventRef, { selectedOutfit: selectedItems });
      } else {
        await setDoc(eventRef, { ...event, selectedOutfit: selectedItems });
      }
      navigation.navigate('PlanEventScreen', { event: { ...event, selectedOutfit: selectedItems } });
    } catch (error) {
      Alert.alert('Error', 'Failed to save outfit.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.some(i => i.id === item.id);
    return (
      <TouchableOpacity onPress={() => handleSelectItem(item)} style={styles.itemContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.itemInfo}>Selected Box: {item.selectedBox || 'N/A'}</Text>
          <Text style={styles.itemInfo}>Outfit Type: {item.clothingType || 'N/A'}</Text>
        </View>
        {isSelected && (
          <View style={styles.overlay}>
            <Ionicons name="checkmark-circle" size={32} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Select Your Outfit</Text>
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => 'section-' + index}
          renderItem={({ item }) => (
            <FlatList
              data={item}
              renderItem={renderItem}
              keyExtractor={(subItem) => subItem.id}
              numColumns={3}
              contentContainerStyle={styles.listContainer}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No items found in this wardrobe.</Text>}
        />
        {selectedItems.length > 0 && (
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done ({selectedItems.length})</Text>
          </TouchableOpacity>
        )}
      </View>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EADD', paddingTop: 80 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6B4F4B', textAlign: 'center', marginBottom: 20 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', backgroundColor: '#EFE8E0', padding: 10, color: '#6B4F4B' },
  listContainer: { 
    paddingHorizontal: 5, 
  },
  itemContainer: { 
    flex: 1/3,
    aspectRatio: 1,
    padding: 5,
    position: 'relative',
  },
  itemImage: { width: '100%', height: '70%', borderRadius: 10 },
  infoContainer: { paddingTop: 2, alignItems: 'center', height: '30%' },
  itemName: { fontSize: 12, color: '#6B4F4B', fontWeight: 'bold' },
  itemBox: { fontSize: 10, color: '#A0785A' },
  itemInfo: { fontSize: 10, color: '#6B4F4B' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  doneButton: { backgroundColor: '#A0785A', padding: 15, margin: 20, borderRadius: 25, alignItems: 'center' },
  doneButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#6B4F4B', marginTop: 50 },
});

export default SelectItemsScreen;
