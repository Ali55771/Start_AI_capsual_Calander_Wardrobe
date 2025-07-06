import React, { useContext, useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const AvatarPreviewScreen = () => {
  const navigation = useNavigation();
  const { user, handleSaveProfile } = useContext(UserContext);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    if (!user) return;

    const fetchAvatar = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setAvatar(userSnap.data().profileImage || null);
        }
      } catch (error) {
        console.error("❌ Error fetching avatar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [user]);

  const deleteAvatar = async () => {
    if (!user) return;

    Alert.alert("Delete Avatar", "Are you sure you want to delete your avatar?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { profileImage: "" });

            setAvatar(null);
            Alert.alert("Deleted", "Your avatar has been removed.");
          } catch (error) {
            console.error("❌ Error deleting avatar:", error);
            Alert.alert("Error", "Failed to delete avatar.");
          }
        },
      },
    ]);
  };

  return (
    
      <View style={styles.container}>
        {/* ✅ Back Arrow */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeScreen")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
    
        {/* ✅ Delete Avatar Button (Top Right) */}
        {avatar && (
          <TouchableOpacity style={styles.deleteButton} onPress={deleteAvatar}>
            <Ionicons name="trash" size={28} color="red" />
          </TouchableOpacity>
        )}
    
        {/* ✅ Show Avatar or Option to Add New One */}
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : avatar ? (
          <>
            <Image source={{ uri: avatar }} style={styles.avatar} resizeMode="contain" />
            {/* ✅ "Your Avatar Preview" Text Below Avatar, only when avatar exists */}
            <Text style={styles.avatarText}>Your Avatar Preview</Text>
          </>
        ) : (
          <TouchableOpacity style={styles.addAvatarButton} onPress={() => navigation.navigate("AvatarCustomizationScreen")}>
            <Text style={styles.addAvatarText}>Add New Avatar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8E9D2",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
  },
  avatarText: {
    position: "absolute",
    bottom: "20%",  // Adjust text position to be below the avatar
    fontSize: 25,
    fontWeight: "bold",
    color: "#3E2723",
    textAlign: "center",  // Center the text horizontally
  },
  avatar: {
    width: "90%", // Increased width for larger preview
    height: "90%", // Adjust height to allow space for text
    borderRadius: 16,
    zIndex: 10, // Avatar image above text
  },
  addAvatarButton: {
    backgroundColor: "#3E2723",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AvatarPreviewScreen;
