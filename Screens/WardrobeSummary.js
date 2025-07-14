import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { UserContext } from "../context/UserContext"; // Import User Context
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

const WardrobeSummary = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Get user data from context
  const [wardrobeName, setWardrobeName] = useState(user?.wardrobeName || "Unknown Wardrobe");
  const [wardrobeImage, setWardrobeImage] = useState(user?.wardrobeImage || null);
  const [loading, setLoading] = useState(false);

  return (
    <LinearGradient colors={['#F5EADD', '#A0785A']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#9B673E" />
        </TouchableOpacity>
        <Text style={styles.header}>Your Wardrobe </Text>
      </View>

      <View style={styles.wardrobeContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#9B673E" />
        ) : wardrobeImage ? (
          <Image source={{ uri: wardrobeImage }} style={styles.wardrobeImage} />
        ) : (
          <Text style={styles.noImageText}>No wardrobe image available</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => navigation.navigate("WardrobeSetup")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navbar}>
        <FontAwesome5 name="home" size={22} color="#9B673E" />
        <MaterialIcons name="calendar-today" size={22} color="#9B673E" />
        <View style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </View>
        <FontAwesome5 name="boxes" size={22} color="#9B673E" />
        <Ionicons name="person" size={22} color="#9B673E" />
      </View>
      <BottomNav />
    </LinearGradient>
  );
};

export default WardrobeSummary;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#eacda3",
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    left: 15,
    bottom: 2,
    paddingVertical: 5,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9B673E",
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9B673E",
    textAlign: "center",
  },
  wardrobeContainer: {
    backgroundColor: "#EFE8E0",
    width: "90%",
    height: 250,
    padding: 15,
    borderRadius: 10,
    marginTop: 100,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  wardrobeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  noImageText: {
    fontSize: 16,
    color: "#9B673E",
    fontWeight: "bold",
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "110%",
    height: 65,
    backgroundColor: "#EFE8E0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
  },
  nextButton: {
    backgroundColor: "#9B673E",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
