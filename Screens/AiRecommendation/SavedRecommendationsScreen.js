import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import BottomNav from '../../components/BottomNav';

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#23422d',
    borderRadius: 10,
    width: '98%',
    maxWidth: 520,
    marginBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderWidth: 1.2,
    borderColor: '#3FA46A',
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.13)',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  suggestionScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    flex: 1.2,
    textAlign: 'left',
  },
  value: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: '#c62839',
    borderRadius: 8,
    marginTop: 18,
    marginBottom: 18,
    alignItems: 'center',
    alignSelf: 'center',
    width: '98%',
    paddingVertical: 14,
    maxWidth: 520,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default function SavedRecommendationsScreen() {
  const navigation = useNavigation();
  const [savedSuggestions, setSavedSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    const suggestionsRef = ref(db, `savedSuggestions/${user.uid}`);
    const unsubscribe = onValue(suggestionsRef, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setSavedSuggestions(loaded.reverse());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (suggestionId) => {
    Alert.alert(
      "Delete Suggestion",
      "Are you sure you want to delete this suggestion?",
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
              remove(ref(db, `savedSuggestions/${user.uid}/${suggestionId}`));
            }
          }
        }
      ]
    );
  };

  const renderSuggestion = ({ item, index }) => (
    <>
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>{`Suggestion #${savedSuggestions.length - index}`}</Text>
        {Object.entries(item)
          .filter(([key]) => key !== 'id')
          .map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{key.replace(/_/g, ' ')}</Text>
              <Text style={styles.value}>{String(value)}</Text>
            </View>
        ))}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Saved Suggestions</Text>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : savedSuggestions.length === 0 ? (
            <Text style={styles.placeholder}>Your saved suggestions will appear here.</Text>
          ) : (
            renderSuggestion({ item: savedSuggestions[0], index: 0 })
          )}
        </View>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}
