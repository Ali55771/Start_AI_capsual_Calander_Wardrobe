import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const WardrobeAssignTags = ({ route, navigation }) => {
  const { user } = useUser();
  const { wardrobeItem } = route.params;
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = [
    'Casual', 'Formal', 'Work', 'Party',
    'Summer', 'Winter', 'Spring', 'Fall',
    'Favorite', 'New', 'Vintage'
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleNext = () => {
    navigation.navigate('WardrobeSummary', {
      ...wardrobeItem,
      tags: selectedTags,
      userId: user?.uid
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Tags</Text>
      
      <ScrollView style={styles.tagsContainer}>
        <View style={styles.tagGrid}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.selectedTag
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#9B673E',
  },
  tagsContainer: {
    flex: 1,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B673E',
    marginBottom: 10,
  },
  selectedTag: {
    backgroundColor: '#9B673E',
  },
  tagText: {
    color: '#9B673E',
    fontSize: 16,
  },
  selectedTagText: {
    color: '#FFF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9B673E',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default WardrobeAssignTags; 