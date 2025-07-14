import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, push, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const API_URL = 'http://10.211.0.225:5000'; // Make sure this IP is correct

function sanitizeKeys(obj) {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    const safeKey = key.replace(/[.#$\[\]/]/g, '_');
    newObj[safeKey] = obj[key];
  });
  return newObj;
}

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label.replace(/_/g, ' ')}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

export default function RecommendationScreen({ navigation, route }) {
  const { recommendations: initialRecommendations } = route.params;
  const [recommendations, setRecommendations] = useState(initialRecommendations.map(rec => ({ ...rec, status: 'pending' })));

  const sendFeedback = async (outfit, feedback) => {
    try {
      // Remove status before sending
      const { status, ...outfitData } = outfit;
      await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfit: outfitData, feedback }),
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
      Alert.alert('Error', 'Could not send feedback to the server.');
    }
  };

  const handleReject = (outfitToReject, index) => {
    sendFeedback(outfitToReject, 'rejected');
    setRecommendations(current => current.filter((_, i) => i !== index));
  };

  const handleAccept = (outfitToAccept, index) => {
    sendFeedback(outfitToAccept, 'accepted');
    setRecommendations(current => 
      current.map((outfit, i) => (i === index ? { ...outfit, status: 'accepted' } : outfit))
    );
  };

  // Add this function to save accepted suggestions to Firebase
  const handleSaveSuggestions = async () => {
    const accepted = recommendations.filter(r => r.status === 'accepted');
    if (accepted.length === 0) {
      Alert.alert('No Suggestions', 'Please accept at least one suggestion to save.');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
      const db = getDatabase();
      const userSuggestionsRef = ref(db, `savedSuggestions/${user.uid}`);
      // Remove all previous saved suggestions before saving new ones
      await remove(userSuggestionsRef);
      for (const suggestion of accepted) {
        await push(userSuggestionsRef, sanitizeKeys(suggestion));
      }
      Alert.alert('Success', 'Your suggestion saved successfully!');
    } catch (error) {
      console.log('Firebase save error:', error);
      Alert.alert('Error', 'Failed to save suggestions.');
    }
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Our Suggestions For You</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {recommendations.map((outfit, index) => {
          // Filter out details that are not applicable
          const outfitDetails = Object.entries(outfit).filter(([key, value]) => 
            key !== 'status' && value && value.toLowerCase() !== 'n/a' && value.toLowerCase() !== 'not required'
          );

          return (
            <LinearGradient 
                key={index}
                colors={outfit.status === 'accepted' ? ['#2E4B3D', '#1A2920'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={[styles.detailsContainer, outfit.status === 'accepted' && styles.acceptedCard]}
            >
                <Text style={styles.recommendationTitle}>{`Suggestion #${index + 1}`}</Text>
                {outfitDetails.map(([key, value]) => (
                    <DetailRow key={key} label={key} value={value} />
                ))}

                {outfit.status === 'pending' && (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(outfit, index)}>
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAccept(outfit, index)}>
                      <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
                {outfit.status === 'accepted' && (
                    <View style={styles.acceptedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                )}
            </LinearGradient>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.buttonPressed]}>
          <Ionicons name="refresh" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Try Another</Text>
        </Pressable>
        <Pressable
          onPress={handleSaveSuggestions}
          style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.buttonPressed, { marginLeft: 10, opacity: recommendations.some(r => r.status === 'accepted') ? 1 : 0.5 }]}
          disabled={!recommendations.some(r => r.status === 'accepted')}
        >
          <Ionicons name="save" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Save Suggestions</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  content: { flexGrow: 1, padding: 20 },
  detailsContainer: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20, // Add space between cards
  },
  acceptedCard: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  rejectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  acceptedIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.3)',
  },
  acceptedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    paddingTop: 10 
  },
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 18, 
    borderRadius: 15, 
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  primaryButton: { backgroundColor: '#C4704F' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  secondaryButton: { backgroundColor: '#4CAF50' },
});