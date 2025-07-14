import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import ClothingDetailsForm from './ClothingDetailsForm';
import BottomNav from '../components/BottomNav';

export default function AddClothingScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const { wardrobeId, boxName } = route.params || {};
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleImagePicker = async (type) => {
    const permissionMethod =
      type === 'camera'
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const permission = await permissionMethod();
    if (permission.status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: `Please grant ${type} access to continue.`,
      });
      return;
    }

    const launchMethod =
      type === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const headerAnim = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }],
  };

  const uploaderAnim = {
    opacity: anim,
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <Animated.View style={[styles.header, headerAnim]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Item</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, {paddingBottom: 90}]}>
        {!image ? (
          <Animated.View style={[styles.uploaderContainer, uploaderAnim]}>
            <Text style={styles.uploaderTitle}>Add a Photo</Text>
            <Text style={styles.uploaderSubtitle}>Choose how to add your clothing photo</Text>
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker('camera')}>
                <Ionicons name="camera-outline" size={32} color="#C4704F" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker('gallery')}>
                <Ionicons name="folder-open-outline" size={32} color="#C4704F" />
                <Text style={styles.uploadButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.formContainer}>
            <Animated.Image source={{ uri: image }} style={[styles.imagePreview, uploaderAnim]} />
            <ClothingDetailsForm image={image} wardrobeId={wardrobeId} boxName={boxName} />
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  uploaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  uploaderSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '45%',
  },
  uploadButtonText: {
    marginTop: 10,
    color: '#F0E5DE',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '90%',
    aspectRatio: 4 / 5,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
