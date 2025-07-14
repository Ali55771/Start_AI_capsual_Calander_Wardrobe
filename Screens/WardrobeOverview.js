import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

// Sample wardrobe data (Can be fetched from a database or state)
const initialWardrobe = {
  Jackets: [
    { id: 1, name: "Leather Jacket"},
    { id: 2, name: "Denim Jacket" },
  ],
  Shirts: [{ id: 3, name: "White Shirt",  }],
  Pants: [{ id: 4, name: "Blue Jeans" }],
  Shoes: [{ id: 5, name: "Leather Shoes" }],
};

const WardrobeOverview = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedBox } = route.params || {};

  console.log("Navigated with selectedBox:", selectedBox);

  const [wardrobe, setWardrobe] = useState(initialWardrobe);

  return (
    <LinearGradient colors={['#FAF3E0', '#A0785A']} style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#9B673E" />
        </TouchableOpacity>
        <Text style={styles.header}>My Wardrobe</Text>
      </View>

      {/* Display Wardrobe Categories */}
      <FlatList
        data={Object.keys(wardrobe)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{item}</Text>
            <View style={styles.itemRow}>
              {wardrobe[item].map((wardrobeItem) => (
                <View key={wardrobeItem.id} style={styles.itemCard}>
                  <Image source={wardrobeItem.image} style={styles.itemImage} />
                  <Text style={styles.itemLabel}>{wardrobeItem.name}</Text>
                </View>
              ))}
              {/* Add Button for New Items */}
              <TouchableOpacity style={styles.addButtonCard} activeOpacity={0.8}>
               
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.navbar}>
        <FontAwesome5 name="home" size={22} color="#9B673E" />
        <MaterialIcons name="calendar-today" size={22} color="#9B673E" />
        <View style={styles.addButtonMain}>
          <Ionicons name="add" size={30} color="white" />
        </View>
        <FontAwesome5 name="boxes" size={22} color="#9B673E" />
        <Ionicons name="person" size={22} color="#9B673E" />
      </View>
      <BottomNav />
    </LinearGradient>
  );
};

export default WardrobeOverview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
    alignItems: "center",
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#FAF3E0",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9B673E",
    textAlign: "center",
  },
  categoryContainer: {
    width: "90%",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9B673E",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemCard: {
    width: width * 0.3,
    height: width * 0.3,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#9B673E",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  itemImage: {
    width: "80%",
    height: "70%",
    borderRadius: 8,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9B673E",
    marginTop: 5,
    textAlign: "center",
  },
  addButtonCard: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D3D3D3",
  },
  boxImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    position: "absolute",
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 65,
    backgroundColor: "#EFE8E0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
  },
  addButtonMain: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9B673E",
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
  },
});
