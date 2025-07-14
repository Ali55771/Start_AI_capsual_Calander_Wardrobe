import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { collection, doc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';


function WardrobeOrganizationScreen() {
  const navigation = useNavigation();
  const { user, db } = useContext(UserContext); // Fetch db from UserContext
  const [loading, setLoading] = useState(true);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("All");
  const uniqueBoxes = ["All", ...new Set(wardrobeItems.map(item => item.selectedBox))];
  const [expandedType, setExpandedType] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const filteredWardrobe = selectedSeason === "All"
  ? wardrobeItems
  : wardrobeItems.filter((item) => item.selectedBox === selectedSeason);

  useEffect(() => {
    if (user) {
      fetchWardrobeItems();
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [wardrobeItems]);

  const fetchWardrobeItems = async () => {
    setLoading(true);
    try {
      const wardrobeQuery = query(collection(db, 'wardrobes'), where('userId', '==', user.uid));
      const wardrobesSnapshot = await getDocs(wardrobeQuery);
      let allItems = [];

      for (const wardrobeDoc of wardrobesSnapshot.docs) {
        const wardrobeData = { ...wardrobeDoc.data(), id: wardrobeDoc.id };
        const itemsQuery = collection(db, 'wardrobes', wardrobeDoc.id, 'items');
        const itemsSnapshot = await getDocs(itemsQuery);
        
        itemsSnapshot.forEach(itemDoc => {
          allItems.push({
            ...itemDoc.data(),
            id: itemDoc.id,
            wardrobeId: wardrobeDoc.id, // Keep track of which wardrobe it belongs to
            wardrobeName: wardrobeData.wardrobeName
          });
        });
      }

      setWardrobeItems(allItems);
    } catch (error) {
      console.error("Error fetching wardrobe items:", error);
      Alert.alert("Error", "Could not fetch wardrobe items.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (itemToDelete) => {
    try {
      await deleteDoc(doc(db, 'wardrobes', itemToDelete.wardrobeId, 'items', itemToDelete.id));
      setWardrobeItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      Alert.alert('Success', 'Item deleted successfully.');
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };
  
  const [expandedBox, setExpandedBox] = useState(null); // Track which box is expanded

  const groupedByBox = filteredWardrobe.reduce((acc, item) => {
    acc[item.selectedBox] = acc[item.selectedBox] || [];
    acc[item.selectedBox].push(item);
    return acc;
  }, {});
  
  return (
    <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
            <Ionicons name="arrow-back" size={24} color="#9B673E" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.shirtIcon}>
              <Ionicons name="shirt-outline" size={22} color="#9B673E" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Your Wardrobe</Text>
          </View>




          <TouchableOpacity onPress={() => navigation.navigate("AddClothingScreen")}>
            <Ionicons name="add-circle" size={30} color="#9B673E" />
          </TouchableOpacity>
        </View>

        
        <View style={styles.seasonTabs}>
          {uniqueBoxes.map((box) => (
            <TouchableOpacity
              key={box}
              style={[styles.seasonTab, selectedSeason === box && styles.activeTab]}
              onPress={() => setSelectedSeason(box)} // Set selected box for filtering
            >
              <Text style={selectedSeason === box ? styles.activeTabText : styles.tabText}>
                {box}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#9B673E" />
        ) : (
          Object.keys(groupedByBox).map((box) => (
            // Only show the clothing items of the selected box
            (selectedSeason === "All" || selectedSeason === box) && (
              <View key={box} style={styles.categoryContainer}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => setExpandedBox(expandedBox === box ? null : box)} // Toggle expanded box
                >
                  <Text style={styles.categoryTitle}>{box}</Text> 
                  <Ionicons
                    name={expandedBox === box ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#9B673E"
                  />
                </TouchableOpacity>
  
                {expandedBox === box && (
                  <FlatList
                    data={groupedByBox[box]} // Display clothing items from the selected box
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }) => (
                      <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl }} style={styles.wardrobeImage} />
                        <Text style={styles.itemLabel}>{item.outfitType}</Text>

                        {/* Display additional details */}
                        <Text style={styles.clothingType}> {item.clothingType}</Text>

                        <Text style={styles.colour}> {item.Colour}</Text> 

 
                        
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate("ClothingDetailsForm", { item })}
                          >
                            <Ionicons name="create-outline" size={20} color="#fff" />
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />


                )}

                
              </View>
            )
          ))
        )}
      </Animated.View>
    </LinearGradient>
  );
  
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5E3D3",
    padding: 20,
  },
  innerContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10, // Added padding for more space on the sides
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  shirtIcon: {
    
    marginLeft: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9B673E",
    textAlign: "center", // Ensuring the text is centered in its container
    flex: 1,
  },
  seasonTabs: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 20,
  },
  seasonTab: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    backgroundColor: "#E0C9B2",
  },
  activeTab: { 
    backgroundColor: "#9B673E" 
  },
  tabText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#5A3C2C",
  },
  activeTabText: { 
    color: "#FFF" 
  },
  categoryContainer: { 
    marginBottom: 30, 
    marginTop: 10,
  },
  categoryHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    backgroundColor: "#EAD7C5", 
    borderRadius: 15, 
    marginBottom: 10,
  },
  categoryTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#5A3C2C",
  },
  card: { 
    flex: 1, 
    margin: 10, 
    backgroundColor: "#EAD7C5", 
    padding: 15, 
    borderRadius: 15, 
    alignItems: "center",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, 
    shadowRadius: 6,
    elevation: 5,
  },
  wardrobeImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 15, 
    marginBottom: 10, 
  },
  itemLabel: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#5A3C2C", 
    marginBottom: 5,
  },
  boxDetails: { 
    fontSize: 14, 
    color: "#9B673E", 
    marginBottom: 10, 
  },
  actionButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    marginTop: 10,
  },
  editButton: { 
    backgroundColor: "#4CAF50", 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center",
  },
  deleteButton: { 
    backgroundColor: "#E53935", 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center",
  },
});

export default WardrobeOrganizationScreen;
