import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

const API_URL = "http://10.211.0.75:5000";

const AvatarCustomizationScreen = () => {
  const navigation = useNavigation();
  const { user, handleSaveProfile } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cartoonImage, setCartoonImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to gallery.");
      }
    })();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileType = asset.uri.split(".").pop().toLowerCase();
        const mimeType = fileType === "png" ? "image/png" : "image/jpeg";

        setSelectedImage({
          uri: asset.uri,
          type: mimeType,
          name: `photo.${fileType}`,
        });

        setCartoonImage(null);
      }
    } catch (error) {
      console.error("❌ ImagePicker Error:", error);
      Alert.alert("Error", "Failed to pick an image. Try again.");
    }
  };

  const uploadAndCartoonify = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "No image selected. Please choose an image.");
      return;
    }

    setLoading(true);
    setCartoonImage(null);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.name,
      });

      const response = await fetch(`${API_URL}/cartoonify`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Server error: ${response.status}`);
      }

      const jsonResponse = await response.json();
      let cartoonImageBase64 = jsonResponse?.cartoonImage;

      if (!cartoonImageBase64) {
        throw new Error("Invalid response from server. No cartoon image received.");
      }

      // Ensure the base64 string includes the prefix
      if (!cartoonImageBase64.startsWith("data:image")) {
        cartoonImageBase64 = `data:image/png;base64,${cartoonImageBase64}`;
      }

      setCartoonImage(cartoonImageBase64);
    } catch (error) {
      console.error("⚠️ API Error:", error);
      Alert.alert("Error", error.message || "Failed to process the image.");
    } finally {
      setLoading(false);
    }
  };

  const saveAvatar = async () => {
    if (!cartoonImage) {
      Alert.alert("Error", "No cartoon image available to save.");
      return;
    }

    try {
      const base64Data = cartoonImage.includes(",")
        ? cartoonImage.split(",")[1] // Extract base64 content
        : cartoonImage;

      const fileUri = `${FileSystem.documentDirectory}cartoon-avatar.png`;

      // Save the base64 data as an image file locally
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Only update the profile image (avatar) in the user profile
      handleSaveProfile(null, fileUri); // Pass null for username to not change it

      Alert.alert("Success", "Avatar saved successfully!");

      // Navigate to Avatar Preview screen and pass the avatar URI
      navigation.navigate("AvatarPreviewScreen", { avatarUri: fileUri });
    } catch (error) {
      console.error("⚠️ Save Error:", error);
      Alert.alert("Save Error", "Failed to save the avatar. Please try again.");
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#C4704F" />
      </TouchableOpacity>

      <Text style={styles.title}>Avatar Customization</Text>

      {/* Custom Button for selecting an image */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={styles.selectImageButton}
          onPress={selectImage}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.selectImageButtonText}>Select Image from Gallery</Text>
        </TouchableOpacity>
      </Animated.View>

      {selectedImage && (
        <>
          <Text style={styles.label}>Selected Image:</Text>
          <Image source={{ uri: selectedImage.uri }} style={styles.image} resizeMode="contain" />
        </>
      )}

      {/* Custom Button for generating cartoon avatar */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.generateButton, { opacity: selectedImage ? 1 : 0.6 }]}
          onPress={uploadAndCartoonify}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!selectedImage || loading}
        >
          <Text style={styles.generateButtonText}>Generate Cartoon Avatar</Text>
        </TouchableOpacity>
      </Animated.View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4704F" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}

      {cartoonImage && (
        <>
          <Text style={styles.label}>Cartoon Avatar:</Text>
          <Image source={{ uri: cartoonImage }} style={styles.image} resizeMode="contain" />

          {/* Save Button for saving the avatar */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveAvatar}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.saveButtonText}>Save Avatar</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2c1d1a",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#C4704F",
    letterSpacing: 1,
    textShadowColor: "#4a302d",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    color: "#EADBC8",
    fontWeight: "500",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C4704F",
    backgroundColor: "#F8E9D2",
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#C4704F",
    fontWeight: "bold",
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
  selectImageButton: {
    backgroundColor: "#C4704F",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "80%",
    elevation: 3,
    shadowColor: "#4a302d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  selectImageButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  generateButton: {
    backgroundColor: "#4a302d",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "80%",
    elevation: 3,
    shadowColor: "#C4704F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  saveButton: {
    backgroundColor: "#C4704F",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "50%",
    elevation: 3,
    shadowColor: "#4a302d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default AvatarCustomizationScreen;
