import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import BottomNav from '../components/BottomNav';
import { UserContext } from '../context/UserContext';

const ViewBoxesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { season, boxCount, initialLabels, isViewing, onWardrobeCreated, wardrobeId } = route.params;
  const { user } = useContext(UserContext);

  const [labels, setLabels] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
  const [labelText, setLabelText] = useState('');

  useEffect(() => {
    if (wardrobeId) {
      const fetchWardrobe = async () => {
        try {
          const wardrobeDoc = await getDoc(doc(db, 'wardrobes', wardrobeId));
          if (wardrobeDoc.exists()) {
            const wardrobeData = wardrobeDoc.data();
            setLabels(wardrobeData.labels || []);
          }
        } catch (error) {
          console.error('Error fetching wardrobe:', error);
          Alert.alert('Error', 'Failed to load wardrobe data');
        }
      };
      fetchWardrobe();
    } else if (initialLabels) {
      setLabels(initialLabels);
    } else {
      setLabels(Array(parseInt(boxCount, 10) || 0).fill(''));
    }
  }, [boxCount, initialLabels, wardrobeId]);

  const handleOpenModal = (index) => {
    setCurrentEditingIndex(index);
    setLabelText(labels[index]);
    setModalVisible(true);
  };

  const handleSaveLabel = async () => {
    const trimmedLabel = labelText.trim();
    if (!trimmedLabel) {
      Alert.alert('Invalid Label', 'Please enter a label before saving.');
      return;
    }

    const newLabels = [...labels];
    newLabels[currentEditingIndex] = trimmedLabel;
    setLabels(newLabels);

    if (wardrobeId) {
      try {
        await updateDoc(doc(db, 'wardrobes', wardrobeId), {
          labels: newLabels
        });
      } catch (error) {
        console.error('Error updating wardrobe:', error);
        Alert.alert('Error', 'Failed to save label');
      }
    }

    setModalVisible(false);
    setLabelText('');
  };

  const handleAddBox = async () => {
    const newLabels = [...labels, ''];
    setLabels(newLabels);

    if (wardrobeId) {
      try {
        await updateDoc(doc(db, 'wardrobes', wardrobeId), {
          labels: newLabels,
          boxCount: String(newLabels.length),
        });
      } catch (error) {
        console.error('Error adding box:', error);
        Alert.alert('Error', 'Failed to add box');
        setLabels(labels.slice(0, -1)); // Revert state
      }
    }
  };

  const handleDeleteBox = (index) => {
    Alert.alert(
      'Delete Box',
      'Are you sure you want to delete this box?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const newLabels = labels.filter((_, i) => i !== index);
            setLabels(newLabels);

            if (wardrobeId) {
              try {
                await updateDoc(doc(db, 'wardrobes', wardrobeId), {
                  labels: newLabels,
                  boxCount: String(newLabels.length),
                });
              } catch (error) {
                console.error('Error deleting box:', error);
                Alert.alert('Error', 'Failed to delete box');
                setLabels(labels); // Revert state
              }
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleFinishAndSave = async () => {
    try {
      // Fetch existing wardrobes for this user and season
      const userId = user?.uid;
      if (!userId) {
        Alert.alert('Error', 'User not found.');
        return;
      }
      const q = query(collection(db, 'wardrobes'), where('userId', '==', userId), where('season', '==', season));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert('Duplicate Wardrobe', 'A wardrobe with this name/season already exists. Please choose a different name or season.');
        return;
      }
      const newWardrobe = {
        id: Date.now().toString(),
        season,
        boxCount: String(labels.length),
        labels,
        userId,
      };
      if (onWardrobeCreated) {
        onWardrobeCreated(newWardrobe);
      }
      navigation.navigate('WardrobeCreationScreen', { newWardrobe });
    } catch (error) {
      Alert.alert('Error', 'Failed to save wardrobe.');
      console.error(error);
    }
  };

  const renderBox = (index) => {
    const hasLabel = labels[index] !== '';
    const boxName = labels[index];

    const handleBoxPress = () => {
      if (isViewing && hasLabel) {
        navigation.navigate('BoxItemsScreen', {
          wardrobeId: wardrobeId,
          boxName: boxName,
        });
      }
    };

    return (
      <View key={index} style={styles.boxContainer}>
        <TouchableOpacity onPress={handleBoxPress} disabled={!isViewing || !hasLabel} style={styles.touchableBox}>
          <LinearGradient colors={['#C5A78F', '#A0785A']} style={styles.largeBox}>
            {hasLabel && <Text style={styles.boxLabelText}>{boxName}</Text>}
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.boxActions}>
          <TouchableOpacity 
            style={styles.addLabelButton}
            onPress={() => handleOpenModal(index)}
          >
            <Text style={styles.addLabelButtonText}>{hasLabel ? 'Edit Label' : 'Add Label'}</Text>
          </TouchableOpacity>
          {isViewing && (
            <TouchableOpacity
              style={styles.deleteBoxButton}
              onPress={() => handleDeleteBox(index)}
            >
              <Ionicons name="trash-outline" size={24} color="#A0785A" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{season.replace('(A)', '(Autumn)')} Wardrobe</Text>
      </View>
      <Text style={styles.subTitle}>All Boxes</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, {paddingBottom: 90}]}>
        {labels.map((_, index) => renderBox(index))}
        {isViewing && (
          <TouchableOpacity style={styles.finishButton} onPress={handleAddBox}>
            <LinearGradient
              colors={['#C5A78F', '#A0785A']}
              style={styles.finishButtonGradient}
            >
              <Text style={styles.finishButtonText}>Add New Box</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {!isViewing && (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishAndSave}>
            <LinearGradient
              colors={['#C5A78F', '#A0785A']}
              style={styles.finishButtonGradient}
            >
              <Text style={styles.finishButtonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Label</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Type Your Label for this box"
              placeholderTextColor="#A0785A"
              value={labelText}
              onChangeText={setLabelText}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLabel}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4F4B',
  },
  editButton: {
    fontSize: 18,
    color: '#6B4F4B',
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 22,
    color: '#6B4F4B',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  boxContainer: {
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  touchableBox: {
    width: '100%',
  },
  largeBox: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  boxActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addLabelButton: {
    backgroundColor: '#C5A78F',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  addLabelButtonText: {
    color: '#6B4F4B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBoxButton: {
    marginLeft: 15,
    padding: 5,
  },
  finishButton: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20, // add space above BottomNav
  },
  finishButtonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#E6D5C3',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4F4B',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5EADD',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#6B4F4B',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#A0785A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ViewBoxesScreen;
