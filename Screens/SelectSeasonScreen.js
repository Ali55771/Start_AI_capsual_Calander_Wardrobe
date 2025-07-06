import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SelectSeasonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { existingWardrobes = [] } = route.params;
  const [selectedSeason, setSelectedSeason] = useState(null);

  const seasons = ['Spring', 'Summer', 'Fall(A)', 'Winter'];
  const existingSeasons = existingWardrobes.map(w => w.season);

  const handleSelectSeason = (season) => {
    setSelectedSeason(season);
  };

  const handleNext = () => {
    if (selectedSeason) {
      navigation.navigate('AddBoxesScreen', { 
        season: selectedSeason,
        onWardrobeCreated: route.params?.onWardrobeCreated
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#A0785A" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Wardrobe Creation</Text>
      <Text style={styles.subTitle}>Select Season</Text>

      <View style={styles.seasonsGrid}>
        {seasons.map((season) => {
          const isCreated = existingSeasons.includes(season);
          return (
            <View key={season} style={styles.seasonContainer}>
              <View style={[styles.dot, selectedSeason === season && styles.dotSelected]} />
              <TouchableOpacity 
                onPress={() => !isCreated && handleSelectSeason(season)}
                disabled={isCreated}
              >
                <LinearGradient
                  colors={
                    isCreated 
                      ? ['#BDBDBD', '#BDBDBD']
                      : selectedSeason === season 
                      ? ['#A0785A', '#C5A78F'] 
                      : ['#C5A78F', '#A0785A']
                  }
                  style={styles.seasonButton}
                >
                  <Text style={styles.seasonText}>{season}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        })} 
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        disabled={!selectedSeason}
      >
        <LinearGradient
            colors={!selectedSeason ? ['#D3D3D3', '#A9A9A9'] : ['#C5A78F', '#A0785A']}
            style={styles.nextButtonGradient}
        >
            <Text style={styles.nextButtonText}>Next</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4F4B',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    color: '#6B4F4B',
    textDecorationLine: 'underline',
    marginBottom: 40,
  },
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '90%',
  },
  seasonContainer: {
    alignItems: 'center',
    margin: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C5A78F',
    marginBottom: 8,
  },
  dotSelected: {
    backgroundColor: '#A0785A',
  },
  seasonButton: {
    width: 120,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  seasonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
  },
  nextButtonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SelectSeasonScreen;
