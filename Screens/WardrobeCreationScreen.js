import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';
import { db } from '../config/firebaseConfig';
import BottomNav from '../components/BottomNav';

const WardrobeCreationScreen = () => {
  const { user } = useContext(UserContext); // Get user from context
  const navigation = useNavigation();
  const route = useRoute();
  const [wardrobes, setWardrobes] = useState([]);
  const from = route.params?.from;

  // Load saved wardrobes when component mounts
  useEffect(() => {
    loadWardrobes();
  }, []);

  // Save wardrobes whenever they change


  const loadWardrobes = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'wardrobes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const loadedWardrobes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setWardrobes(loadedWardrobes);
    } catch (error) {
      console.error('Error loading wardrobes:', error);
      Alert.alert('Error', 'Failed to load wardrobes');
    }
  };

  const saveWardrobes = async (newWardrobe) => {
    try {
      if (!newWardrobe) {
        throw new Error('Wardrobe data is required');
      }
      
      // Check total wardrobe limit
      if (wardrobes.length >= 4) {
        Alert.alert(
          'Wardrobe Limit Exceeded',
          'You can only create 4 wardrobes. To create a new one, please delete an existing wardrobe first.'
        );
        return null;
      }

      // Check for duplicate season
      const existingWardrobe = wardrobes.find(w => w.season === newWardrobe.season);
      if (existingWardrobe) {
        Alert.alert(
           'Duplicate Season',
           `A wardrobe for the ${newWardrobe.season} season already exists. You can only create one wardrobe per season.`
         );
        return null;
      }

      const wardrobeToSave = { 
        ...newWardrobe,
        isActive: false // Default to inactive
      };

      const docRef = await addDoc(collection(db, 'wardrobes'), wardrobeToSave);
      const savedWardrobe = { ...wardrobeToSave, id: docRef.id };
      console.log('Saved wardrobe with ID:', savedWardrobe.id);
      Alert.alert('Success', 'New wardrobe has been created successfully!');
      return savedWardrobe;
    } catch (error) {
      console.error('Error saving wardrobe:', error);
      Alert.alert('Error', 'An error occurred while creating the wardrobe. Please try again.');
      return null;
    }
  };

  const deleteWardrobe = async (wardrobeId) => {
    try {
      await deleteDoc(doc(db, 'wardrobes', wardrobeId));
      setWardrobes(prevWardrobes => prevWardrobes.filter(w => w.id !== wardrobeId));
      Alert.alert('Success', 'Wardrobe has been successfully deleted.');
    } catch (error) {
      console.error('Error deleting wardrobe:', error);
      Alert.alert('Error', 'An error occurred while deleting the wardrobe. Please try again.');
    }
  };

  const activateWardrobe = async (wardrobeId) => {
    try {
      // First, deactivate all other wardrobes
      const updatePromises = wardrobes.map(wardrobe => {
        if (wardrobe.id !== wardrobeId) {
          return updateDoc(doc(db, 'wardrobes', wardrobe.id), { isActive: false });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      // Then activate the selected wardrobe
      await updateDoc(doc(db, 'wardrobes', wardrobeId), { isActive: true });
      
      // Update local state
      setWardrobes(prevWardrobes => 
        prevWardrobes.map(wardrobe => ({
          ...wardrobe,
          isActive: wardrobe.id === wardrobeId
        }))
      );
      
      Alert.alert('Success', 'Wardrobe activated successfully!');
    } catch (error) {
      console.error('Error activating wardrobe:', error);
      Alert.alert('Error', 'An error occurred while activating the wardrobe. Please try again.');
    }
  };

  const deactivateWardrobe = async (wardrobeId) => {
    try {
      await updateDoc(doc(db, 'wardrobes', wardrobeId), { isActive: false });
      
      // Update local state
      setWardrobes(prevWardrobes => 
        prevWardrobes.map(wardrobe => 
          wardrobe.id === wardrobeId 
            ? { ...wardrobe, isActive: false }
            : wardrobe
        )
      );
      
      Alert.alert('Success', 'Wardrobe deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating wardrobe:', error);
      Alert.alert('Error', 'An error occurred while deactivating the wardrobe. Please try again.');
    }
  };

  const handleWardrobePress = (wardrobe) => {
    if (from === 'open') {
      // When opening wardrobe, only allow access to active wardrobes
      if (!wardrobe.isActive) {
        Alert.alert(
          'Wardrobe Not Active',
          'Please activate this wardrobe first before opening it.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Activate Now', onPress: () => activateWardrobe(wardrobe.id) }
          ]
        );
        return;
      }
    }
    
    navigation.navigate('ViewBoxesScreen', {
      season: wardrobe.season,
      boxCount: wardrobe.boxCount,
      initialLabels: wardrobe.labels,
      isViewing: true,
      wardrobeId: wardrobe.id // Pass the wardrobe ID
    });
  };

  const handleCreateWardrobe = () => {
    if (wardrobes.length >= 4) {
      Alert.alert(
           'Wardrobe Limit Reached',
           'You can only create 4 wardrobes. Please delete an existing wardrobe to create a new one.'
         );
      return;
    }

    navigation.navigate('SelectSeasonScreen', {
      existingWardrobes: wardrobes,
      onWardrobeCreated: (newWardrobe) => {
        const wardrobeWithOwner = {
          ...newWardrobe,
          userId: user.uid, // Add user ID
          wardrobeName: `${newWardrobe.season.replace('(A)', '(Autumn)')} Wardrobe` // Add wardrobe name
        };
        saveWardrobes(wardrobeWithOwner).then(savedWardrobe => {
          if (savedWardrobe) {
            setWardrobes(prevWardrobes => [...prevWardrobes, savedWardrobe]);
          }
        });
      }
    });
  };

  return (
    <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('WardrobeOptionsScreen')}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {from === 'open' ? 'Open Wardrobe' : 'Wardrobe Creation'}
      </Text>
      <Text style={styles.subTitle}>Your Wardrobes</Text>
      {from === 'open' && (
        <Text style={styles.instructionText}>
          Only active wardrobes can be opened. Activate a wardrobe to access it.
        </Text>
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, {paddingBottom: 90}]}> 
        {wardrobes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.message}>You haven't created any wardrobes yet. Click the button below to create your first wardrobe.</Text>
          </View>
        ) : from === 'open' && !wardrobes.some(w => w.isActive) ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.message}>No active wardrobes available. Please activate a wardrobe to open it.</Text>
          </View>
        ) : (
          wardrobes.map((wardrobe) => (
            <Animated.View key={wardrobe.id} style={{ opacity: 1, transform: [{ scale: 1 }] }}>
              <View style={styles.wardrobeContainer}>
                <TouchableOpacity 
                  style={styles.wardrobeButton} 
                  onPress={() => handleWardrobePress(wardrobe)} 
                  disabled={from === 'create'}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={from === 'open' && !wardrobe.isActive ? ['#D3BFA6', '#A0785A'] : ['#C5A78F', '#A0785A']}
                    style={[
                      styles.wardrobeCard, 
                      wardrobe.isActive && styles.activeWardrobeCard,
                      from === 'open' && !wardrobe.isActive && styles.inactiveWardrobeCard
                    ]}
                  >
                    <Text style={[
                      styles.wardrobeCardText,
                      from === 'open' && !wardrobe.isActive && styles.inactiveWardrobeText
                    ]}>
                      {wardrobe.season.replace('(A)', '(Autumn)')} Wardrobe
                    </Text>
                    {wardrobe.isActive && (
                      <View style={styles.activeIndicator}>
                        <Text style={styles.activeText}>ACTIVE</Text>
                      </View>
                    )}
                    {from === 'open' && !wardrobe.isActive && (
                      <View style={styles.inactiveIndicator}>
                        <Text style={styles.inactiveText}>INACTIVE</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.actionButtons}>
                  {wardrobe.isActive ? (
                    <TouchableOpacity
                      style={styles.deactivateButton}
                      onPress={() => deactivateWardrobe(wardrobe.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pause-circle-outline" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateButton}
                      onPress={() => activateWardrobe(wardrobe.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="play-circle-outline" size={24} color="#4ECDC4" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Wardrobe',
                        'Are you sure you want to delete this wardrobe? This action cannot be undone.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => deleteWardrobe(wardrobe.id), style: 'destructive' }
                        ]
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={24} color="#A0785A" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
      {from !== 'open' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateWardrobe}
          activeOpacity={0.8}
        >
          <LinearGradient
              colors={['#A0785A', '#C5A78F']}
              style={styles.createButtonGradient}
          >
              <Text style={styles.createButtonText}>Create Wardrobe</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      <BottomNav />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wardrobeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
  },
  wardrobeButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
  },
  activateButton: {
    padding: 10,
    marginBottom: 5,
  },
  deactivateButton: {
    padding: 10,
    marginBottom: 5,
  },
  deleteButton: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EADD',
    alignItems: 'center',
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4F4B',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 22,
    color: '#6B4F4B',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B4F4B',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100, // To make space for create button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  message: {
    fontSize: 18,
    color: '#6B4F4B',
    textAlign: 'center',
  },
  wardrobeCard: {
    width: 300,
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  activeWardrobeCard: {
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  inactiveWardrobeCard: {
    borderWidth: 2,
    borderColor: '#999',
    opacity: 0.7,
  },
  wardrobeCardText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inactiveWardrobeText: {
    color: '#666',
  },
  activeIndicator: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  inactiveIndicator: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inactiveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  createButton: {
    position: 'absolute',
    bottom: 90, // move above BottomNav
    width: '80%',
  },
  createButtonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default WardrobeCreationScreen;
