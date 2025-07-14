import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push } from 'firebase/database';
import BottomNav from '../components/BottomNav';

// Color psychology attributes (Energy, Calmness, Professionalism)
const COLOR_PSYCHOLOGY = {
  'Blue': [0.6, 0.8, 0.9],
  'Light Blue': [0.5, 0.9, 0.8],
  'Dark Blue': [0.7, 0.7, 1.0],
  'Navy': [0.7, 0.7, 1.0],
  'White': [0.5, 0.9, 0.9],
  'Light Gray': [0.4, 0.9, 0.8],
  'Dark Gray': [0.3, 0.7, 1.0],
  'Charcoal': [0.3, 0.7, 1.0],
  'Pink': [0.7, 0.7, 0.6],
  'Light Pink': [0.6, 0.8, 0.5],
  'Yellow': [0.9, 0.5, 0.5],
  'Light Yellow': [0.8, 0.7, 0.6],
  'Dark Brown': [0.4, 0.8, 0.8],
  'Black': [0.2, 0.7, 1.0],
  'Brown': [0.4, 0.8, 0.7],
  'Beige': [0.4, 0.9, 0.7],
  'Light Beige': [0.3, 1.0, 0.6],
  'Dark Beige': [0.4, 0.8, 0.8],
  'Gray': [0.3, 0.8, 0.9],
  'Tan': [0.5, 0.8, 0.7],
  'Red': [0.9, 0.3, 0.7],
  'Green': [0.5, 0.8, 0.7],
  'Light Green': [0.4, 0.9, 0.6],
  'Dark Green': [0.6, 0.7, 0.8],
  'Orange': [0.8, 0.5, 0.6],
  'Purple': [0.7, 0.6, 0.8],
};

function getBaseColor(color) {
  if (!color) return '';
  // Remove 'Light', 'Dark', etc.
  return color.replace(/^(Light|Dark)\s+/i, '').trim();
}

function getPsychology(color) {
  const base = getBaseColor(color);
  return COLOR_PSYCHOLOGY[base] || [0.5, 0.5, 0.7];
}

function colorHarmony(color1, color2) {
  // Complementary pairs
  const complements = {
    'Red': 'Green', 'Green': 'Red',
    'Blue': 'Orange', 'Orange': 'Blue',
    'Yellow': 'Purple', 'Purple': 'Yellow',
  };
  const base1 = getBaseColor(color1);
  const base2 = getBaseColor(color2);
  if (complements[base1] === base2) return 2.5;
  if (complements[base2] === base1) return 2.5;
  // Analogous (same family)
  const families = [
    ['Blue', 'Light Blue', 'Dark Blue', 'Navy'],
    ['Gray', 'Light Gray', 'Dark Gray', 'Charcoal'],
    ['Brown', 'Dark Brown', 'Black', 'Beige', 'Tan'],
    ['Red', 'Pink', 'Light Pink'],
    ['Green', 'Light Green', 'Dark Green'],
    ['Yellow', 'Light Yellow'],
  ];
  for (const fam of families) {
    if (fam.includes(base1) && fam.includes(base2)) return 2.0;
  }
  // Monochromatic
  if (base1 === base2) return 1.5;
  // Light-Dark contrast
  const isLight1 = /Light/i.test(color1);
  const isDark1 = /Dark/i.test(color1);
  const isLight2 = /Light/i.test(color2);
  const isDark2 = /Dark/i.test(color2);
  if ((isLight1 && isDark2) || (isLight2 && isDark1)) return 1.7;
  return 1.0;
}

function scoreCombination(combo) {
  // combo: [shirt, pant, shoe, jacket, ...]
  if (combo.length < 2) return 0;
  // Only score if at least 2 items
  // Color harmony (weighted)
  let harmony = 0;
  if (combo.length >= 4) {
    harmony = 3.0 * colorHarmony(combo[0].Colour, combo[1].Colour)
      + 2.0 * colorHarmony(combo[1].Colour, combo[2].Colour)
      + 2.0 * colorHarmony(combo[0].Colour, combo[3].Colour)
      + 1.5 * colorHarmony(combo[3].Colour, combo[1].Colour);
  } else {
    // For 2 or 3 items, just sum all pairwise harmonies
    for (let i = 0; i < combo.length; ++i) {
      for (let j = i + 1; j < combo.length; ++j) {
        harmony += colorHarmony(combo[i].Colour, combo[j].Colour);
      }
    }
  }
  // Psychological balance
  let energy = 0, calm = 0, prof = 0;
  combo.forEach((item, idx) => {
    const [e, c, p] = getPsychology(item.Colour);
    energy += e;
    calm += c;
    prof += p;
  });
  energy /= combo.length;
  calm /= combo.length;
  prof /= combo.length;
  // Ideal mood balance
  const moodBalance = 2.5 - Math.abs(energy - 0.5) - Math.abs(calm - 0.7);
  const profScore = prof * 1.5;
  // Final score
  const finalScore = Math.max(0, harmony * moodBalance * profScore);
  return Math.round(finalScore * 100) / 100;
}

function cartesianProduct(arrays) {
  return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [].concat(d, e))));
}

const CapsuleCombinationsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selected } = route.params || {};
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState([]); // array of indices
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selected && Object.keys(selected).length >= 2) {
      generateCombinations(selected);
    } else {
      setLoading(false);
    }
  }, [selected]);

  const generateCombinations = (selected) => {
    setLoading(true);
    const arrays = Object.values(selected).filter(arr => arr.length > 0);
    if (arrays.length < 2) {
      setCombinations([]);
      setLoading(false);
      return;
    }
    let combos = cartesianProduct(arrays);
    combos = combos.map(combo => ({ combo, score: scoreCombination(combo) }));
    combos.sort((a, b) => b.score - a.score);
    setCombinations(combos.slice(0, 20));
    setAccepted([]);
    setLoading(false);
  };

  const handleAccept = (idx) => {
    setAccepted(prev => {
      if (prev.includes(idx)) return prev;
      if (prev.length >= 5) return prev; // max 5
      return [...prev, idx];
    });
  };

  const handleReject = (idx) => {
    setCombinations(prev => prev.filter((_, i) => i !== idx));
    setAccepted(prev => prev.filter(i => i !== idx));
  };

  const handleSave = async () => {
    if (accepted.length === 0) return;
    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');
      const db = getDatabase();
      const toSave = accepted.map(idx => combinations[idx]);
      for (const item of toSave) {
        await push(ref(db, `savedCombinations/${user.uid}`), {
          combo: item.combo,
          score: item.score,
          savedAt: Date.now(),
        });
      }
      Alert.alert('Success', 'Your combinations saved successfully');
      setAccepted([]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save combinations');
    } finally {
      setSaving(false);
    }
  };

  const renderCombo = ({ item, index }) => {
    const isAccepted = accepted.includes(index);
    return (
      <View style={[styles.comboCard, isAccepted && styles.comboCardAccepted]}>
        <Text style={styles.comboTitle}>Combination #{index + 1} (Score: {item.score})</Text>
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
        <View style={styles.comboActions}>
          <TouchableOpacity
            style={[styles.actionBtn, isAccepted && styles.actionBtnAccepted]}
            onPress={() => handleAccept(index)}
            disabled={isAccepted || accepted.length >= 5}
          >
            <Ionicons name={isAccepted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color={isAccepted ? '#3FA46A' : '#fff'} />
            <Text style={[styles.actionBtnText, isAccepted && { color: '#3FA46A' }]}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleReject(index)}>
            <Ionicons name="close-circle-outline" size={22} color="#c62839" />
            <Text style={[styles.actionBtnText, { color: '#c62839' }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Best Outfit Combinations</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
        ) : combinations.length === 0 ? (
          <Text style={styles.placeholder}>No combinations found. Please select more items.</Text>
        ) : (
          <>
            <FlatList
              data={combinations}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={renderCombo}
              contentContainerStyle={{ paddingBottom: 80 }}
              extraData={accepted}
            />
            <View style={styles.saveContainer}>
              <TouchableOpacity
                style={[styles.saveBtn, (accepted.length === 0 || saving) && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={accepted.length === 0 || saving}
              >
                <Ionicons name="save" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Combinations</Text>
              </TouchableOpacity>
              <Text style={styles.saveHint}>{`Selected: ${accepted.length}/5`}</Text>
            </View>
          </>
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
  comboCardAccepted: {
    borderColor: '#3FA46A',
    backgroundColor: '#23422d99',
  },
  comboActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  actionBtnAccepted: {
    borderColor: '#3FA46A',
    backgroundColor: '#e0ffe0',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  saveContainer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4704F',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  saveHint: {
    color: '#fff',
    fontSize: 14,
    marginTop: 6,
  },
});

export default CapsuleCombinationsScreen; 