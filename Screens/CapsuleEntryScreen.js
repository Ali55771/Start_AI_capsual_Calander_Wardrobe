import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';

const CapsuleEntryScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Capsule Wardrobe</Text>
        <View style={styles.buttonBox}>
          <TouchableOpacity style={styles.entryBtn} onPress={() => navigation.navigate('CapsuleWardrobeScreen')}>
            <Ionicons name="shirt-outline" size={28} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.entryBtnText}>Open Capsule Wardrobe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.entryBtn} onPress={() => navigation.navigate('SavedCombinationsScreen')}>
            <Ionicons name="albums-outline" size={28} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.entryBtnText}>Saved Combinations</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
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
    marginBottom: 40,
  },
  buttonBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4704F',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 18,
    width: 260,
    justifyContent: 'center',
    elevation: 2,
  },
  entryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CapsuleEntryScreen; 