import React, { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Animated } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from "../context/UserContext";
import { LinearGradient } from 'expo-linear-gradient';

const WardrobeSetup = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const [selectedSeason, setSelectedSeason] = useState("summer");
  const [filteredWardrobes, setFilteredWardrobes] = useState([]);
  const [activeWardrobe, setActiveWardrobe] = useState(null); // Track active wardrobe

  const filterWardrobes = useCallback(() => {
    if (user?.wardrobes) {
      return user.wardrobes.filter(
        (wardrobe) => wardrobe.wardrobeName.toLowerCase() === selectedSeason.toLowerCase()
      );
    }
    return [];
  }, [user, selectedSeason]);

  useEffect(() => {
    setFilteredWardrobes(filterWardrobes());
  }, [filterWardrobes, user.wardrobes]);

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
  };

  const toggleActivation = (wardrobe) => {
    setActiveWardrobe((prev) => (prev?.id === wardrobe.id ? null : wardrobe));
  };

  return (
    <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={26} color="#5E3A1D" />
        </TouchableOpacity>
        <Text style={styles.header}>My Wardrobe</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreateWardrobe")} style={styles.plusButton} activeOpacity={0.8}>
          <Ionicons name="add" size={26} color="#5E3A1D" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Select Season</Text>
        <View style={styles.filters}>
          {["summer", "winter", "spring", "autumn"].map((season) => (
            <TouchableOpacity
              key={season}
              onPress={() => handleSeasonChange(season)}
              style={[
                styles.filterButton,
                selectedSeason === season && styles.selectedFilterButton,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedSeason === season && styles.selectedFilterButtonText,
                ]}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredWardrobes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item?.wardrobeImage ? (
              <Image source={{ uri: item.wardrobeImage }} style={styles.itemImage} />
            ) : (
              <Text style={styles.itemText}>No Image Available</Text>
            )}
            <TouchableOpacity
              style={[
                styles.activateButton,
                activeWardrobe?.id === item.id ? styles.activated : {},
              ]}
              onPress={() => toggleActivation(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {activeWardrobe?.id === item.id ? "Deactivate" : "Activate"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noItemsText}>No wardrobes available for this season</Text>}
      />
      <TouchableOpacity
        style={[styles.openWardrobeButton, !activeWardrobe && styles.disabledButton]}
        onPress={() => {
          if (activeWardrobe) {
            navigation.navigate("WardrobeOrganizationScreen", { activeWardrobe });
          }
        }}
        disabled={!activeWardrobe}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Open Wardrobe</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: { padding: 5 },
  plusButton: { padding: 5 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5E3A1D",
    textAlign: "center",
    flex: 1,
  },
  filterContainer: {
    marginBottom: 20,
    width: "80%",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5E3A1D",
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderColor: "#ddd",
    borderWidth: 1,
    alignItems: "center",
  },
  selectedFilterButton: {
    backgroundColor: "#5E3A1D",
    borderColor: "#5E3A1D",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#5E3A1D",
  },
  selectedFilterButtonText: {
    color: "white",
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  itemImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    resizeMode: "cover",
  },
  itemText: {
    fontSize: 16,
    color: "#5E3A1D",
  },
  noItemsText: {
    color: "#5E3A1D",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  activateButton: {
    backgroundColor: "#5E3A1D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  activated: {
    backgroundColor: "#1D5E3A",
  },
  openWardrobeButton: {
    backgroundColor: "#5E3A1D",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default WardrobeSetup;
