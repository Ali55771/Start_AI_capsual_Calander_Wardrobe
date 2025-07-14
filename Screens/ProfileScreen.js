import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert, SafeAreaView, Pressable, Animated, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from "../context/UserContext";
import { useNavigation } from '@react-navigation/native';
import RBSheet from "react-native-raw-bottom-sheet";
import { Picker } from '@react-native-picker/picker';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../components/BottomNav';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, handleSaveProfile } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const refRBSheet = React.useRef();
  const db = getFirestore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sync local state with user context to prevent stale data on render
    if (user) {
      setUpdatedName(user.name || '');
      setSelectedGender(user.gender || '');
      setProfilePic(user.profileImage || null);
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset state to user context values
    if (user) {
      setUpdatedName(user.name || '');
      setSelectedGender(user.gender || '');
      setProfilePic(user.profileImage || null);
    }
  };

  if (!user) {
    return (
      <LinearGradient colors={['#2c1d1a', '#5D4037']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EFEBE9" />
      </LinearGradient>
    );
  }

  const handleImagePicker = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to select an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const handleSaveChanges = () => {
    const updatedData = {
      name: updatedName,
      gender: selectedGender,
      profileImage: profilePic,
    };
    handleSaveProfile(updatedData); // Call context function
    setIsEditing(false);
  };

  return (
    <LinearGradient colors={['#2c1d1a', '#5D4037']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={28} color="#EFEBE9" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
                        <TouchableOpacity onPress={isEditing ? handleCancelEdit : () => setIsEditing(true)} style={styles.headerButton}>
              <FontAwesome name={isEditing ? "close" : "pencil"} size={24} color="#EFEBE9" />
            </TouchableOpacity>
          </View>

          <View style={styles.profilePicContainer}>
            <Pressable onPress={() => isEditing && refRBSheet.current.open()} style={styles.imageWrapper}>
              <Image source={{ uri: profilePic || 'https://picsum.photos/id/65/200/200' }} style={styles.profilePic} />
              {isEditing && (
                <View style={styles.cameraIcon}>
                  <FontAwesome name="camera" size={18} color="#3E2723" />
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.formContainer}>
                        <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={updatedName}
              onChangeText={setUpdatedName}
              placeholder="Enter name"
              placeholderTextColor="#A1887F"
              editable={isEditing}
            />

            <Text style={styles.label}>Email</Text>
            <Text style={[styles.input, styles.disabledInput]}>{user.email}</Text>

            <Text style={styles.label}>Gender</Text>
            <View style={[styles.pickerContainer, !isEditing && styles.disabledInput]}>
              <Picker
                selectedValue={selectedGender}
                onValueChange={(itemValue) => setSelectedGender(itemValue)}
                enabled={isEditing}
                style={styles.picker}
                dropdownIconColor="#D7CCC8"
                mode="dropdown"
              >
                <Picker.Item label="Select Gender" value="" color="#A1887F" />
                <Picker.Item label="Male" value="Male" color="#3E2723" />
                <Picker.Item label="Female" value="Female" color="#3E2723" />
              </Picker>
            </View>

            {isEditing && (
              <AnimatedPressable
                style={[styles.saveButton, { transform: [{ scale: scaleAnim }] }]}
                onPress={handleSaveChanges}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </AnimatedPressable>
            )}
          </View>
        </Animated.ScrollView>

        <RBSheet
          ref={refRBSheet}
          height={280}
          openDuration={250}
          closeOnDragDown={true}
          customStyles={{
            wrapper: { backgroundColor: "rgba(0,0,0,0.6)" },
            container: styles.sheetContainer,
            draggableIcon: styles.sheetDraggableIcon,
          }}
        >
          <Text style={styles.sheetTitle}>Change Profile Photo</Text>
          <TouchableOpacity style={styles.sheetButton} onPress={handleImagePicker}>
            <Ionicons name="camera-outline" size={24} color="#EFEBE9" />
            <Text style={styles.sheetButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetButton} onPress={handlePickImage}>
            <Ionicons name="images-outline" size={24} color="#EFEBE9" />
            <Text style={styles.sheetButtonText}>Choose from Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sheetButton, styles.sheetCancelButton]} onPress={() => refRBSheet.current.close()}>
            <Text style={[styles.sheetButtonText, { color: '#c75e5e' }]}>Cancel</Text>
          </TouchableOpacity>
        </RBSheet>
        <BottomNav />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30 },
  headerTitle: { color: '#EFEBE9', fontSize: 22, fontWeight: 'bold' },
  headerButton: { padding: 5 },
  profilePicContainer: { alignItems: 'center', marginVertical: 20 },
  imageWrapper: { borderRadius: 75, padding: 5, backgroundColor: 'rgba(239, 235, 233, 0.2)' },
  profilePic: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#D7CCC8' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#D7CCC8', padding: 10, borderRadius: 20, borderWidth: 2, borderColor: '#2c1d1a' },
  formContainer: { paddingHorizontal: 25 },
  label: { fontSize: 16, color: '#A1887F', marginBottom: 8, marginLeft: 5 },
  input: { width: '100%', padding: 15, backgroundColor: '#4E342E', borderRadius: 12, color: '#EFEBE9', fontSize: 16, marginBottom: 20 },
  disabledInput: { backgroundColor: '#3E2723' },
  pickerContainer: { backgroundColor: '#4E342E', borderRadius: 12, marginBottom: 20, height: 58, justifyContent: 'center' },
  picker: { color: '#EFEBE9', height: 58, width: '100%' },
  saveButton: { backgroundColor: '#D7CCC8', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#3E2723', fontSize: 18, fontWeight: 'bold' },
  sheetContainer: { backgroundColor: '#3E2723', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  sheetDraggableIcon: { backgroundColor: '#A1887F' },
  sheetTitle: { color: '#EFEBE9', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  sheetButton: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, backgroundColor: '#4E342E', marginBottom: 10 },
  sheetButtonText: { color: '#EFEBE9', fontSize: 16, marginLeft: 20 },
  sheetCancelButton: { backgroundColor: 'transparent', justifyContent: 'center' },
});

export default ProfileScreen;
