import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
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

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to gallery.");
      }
    })();
  }, []);

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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
  
      <Text style={styles.title}>Avatar Customization</Text>
  
      {/* Custom Button for selecting an image */}
      <TouchableOpacity style={styles.selectImageButton} onPress={selectImage}>
        <Text style={styles.selectImageButtonText}>Select Image from Gallery</Text>
      </TouchableOpacity>
  
      {selectedImage && (
        <>
          <Text style={styles.label}>Selected Image:</Text>
          <Image source={{ uri: selectedImage.uri }} style={styles.image} resizeMode="contain" />
        </>
      )}
  
      {/* Custom Button for generating cartoon avatar */}
      <TouchableOpacity
        style={[styles.generateButton, { opacity: selectedImage ? 1 : 0.6 }]} // Make button less opaque if no image selected
        onPress={uploadAndCartoonify}
        disabled={!selectedImage || loading}
      >
        <Text style={styles.generateButtonText}>Generate Cartoon Avatar</Text>
      </TouchableOpacity>
  
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}
  
      {cartoonImage && (
        <>
          <Text style={styles.label}>Cartoon Avatar:</Text>
          <Image source={{ uri: cartoonImage }} style={styles.image} resizeMode="contain" />
  
          {/* Save Button for saving the avatar */}
          <TouchableOpacity style={styles.saveButton} onPress={saveAvatar}>
            <Text style={styles.saveButtonText}>Save Avatar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8E9D2",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    color: "black",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginVertical: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
  },
  selectImageButton: {
    backgroundColor: "#3E2723",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "80%", // Adjust width as needed
  },
  selectImageButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  generateButton: {
    backgroundColor: "#3E2723",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "80%",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#3E2723",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "50%",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default AvatarCustomizationScreen;
