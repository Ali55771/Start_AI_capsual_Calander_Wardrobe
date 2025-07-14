import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const AvatarPreviewScreen = () => {
  const navigation = useNavigation();
  const { user, handleSaveProfile } = useContext(UserContext);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchAvatar();
  }, [user]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      {/* ✅ Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeScreen")}> 
        <Ionicons name="arrow-back" size={28} color="#C4704F" />
      </TouchableOpacity>

      {/* ✅ Delete Avatar Button (Top Right) */}
      {avatar && (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteAvatar} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Ionicons name="trash" size={28} color="#C4704F" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ✅ Show Avatar or Option to Add New One */}
      {loading ? (
        <ActivityIndicator size="large" color="#C4704F" />
      ) : avatar ? (
        <>
          <Animated.Image source={{ uri: avatar }} style={[styles.avatar, { opacity: fadeAnim }]} resizeMode="contain" />
          {/* ✅ "Your Avatar Preview" Text Below Avatar, only when avatar exists */}
          <Text style={styles.avatarText}>Your Avatar Preview</Text>
        </>
      ) : (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.addAvatarButton} onPress={() => navigation.navigate("AvatarCustomizationScreen")}
            onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Text style={styles.addAvatarText}>Add New Avatar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c1d1a",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(196,112,79,0.08)',
    borderRadius: 20,
    padding: 6,
  },
  deleteButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(196,112,79,0.08)',
    borderRadius: 20,
    padding: 6,
  },
  avatarText: {
    position: "absolute",
    bottom: "20%",  // Adjust text position to be below the avatar
    fontSize: 25,
    fontWeight: "bold",
    color: "#C4704F",
    textAlign: "center",  // Center the text horizontally
    textShadowColor: 'rgba(74,48,45,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  avatar: {
    width: "90%", // Increased width for larger preview
    height: "90%", // Adjust height to allow space for text
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C4704F",
    backgroundColor: "#F8E9D2",
    zIndex: 10, // Avatar image above text
  },
  addAvatarButton: {
    backgroundColor: "#C4704F",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: 200,
    elevation: 3,
    shadowColor: "#4a302d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  addAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default AvatarPreviewScreen;
