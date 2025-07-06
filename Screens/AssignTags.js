import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { UserContext } from "../context/UserContext"; // Import User Context

const AssignTags = ({ route }) => {
  const navigation = useNavigation();
  const { saveWardrobeData } = useContext(UserContext); // Access context function

  const { selectedWardrobe = "", selectedBoxes = [], wardrobeImage = null } = route.params || {};
  const [Boxtype, setBoxtype] = useState("");
  const [selectedBox, setSelectedBox] = useState("");
  const [wardrobeItems, setWardrobeItems] = useState([]);

  const addWardrobeItem = async () => {
    if (!selectedBox || !Boxtype) {
      Alert.alert("Missing Data", "Please select both box and box type.");
      return;
    }
  
    const newItem = { selectedBox, Boxtype };
  
    // Prevent duplicate items
    const isDuplicate = wardrobeItems.some(
      (item) => item.selectedBox === newItem.selectedBox && item.Boxtype === newItem.Boxtype
    );
  
    if (isDuplicate) {
      Alert.alert("Duplicate Entry", "This item has already been added.");
      return;
    }
  
    setWardrobeItems([...wardrobeItems, newItem]);
    Alert.alert("Added", "Item added successfully!");
  };
  

  const handleNext = async () => {
    if (!selectedWardrobe || !wardrobeImage) {
      Alert.alert("Missing Data", "Wardrobe name or image is missing.");
      return;
    }
  
    if (wardrobeItems.length === 0) {
      Alert.alert("No items to save", "Please add at least one wardrobe item before proceeding.");
      return;
    }
  
    try {
      console.log("Saving Data:", { selectedWardrobe, wardrobeImage, wardrobeItems });
      await saveWardrobeData(selectedWardrobe, wardrobeImage, wardrobeItems);
      
      Alert.alert("Success", "Wardrobe items saved successfully!");
      
      navigation.navigate("WardrobeSetup", { selectedWardrobe, wardrobeImage, wardrobeItems }); // Ensure data is passed forward
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save wardrobe items. Please try again.");
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.topBackground}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#9B673E" />
          </TouchableOpacity>
          <Text style={styles.header}>{selectedWardrobe}</Text>
        </View>
      </View>

      {wardrobeImage && <Image source={{ uri: wardrobeImage }} style={styles.wardrobeImage} resizeMode="contain" />}

      <View style={styles.tagContainer}>
        <Text style={styles.inputLabel}>Select Box:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedBox} onValueChange={setSelectedBox}>
            <Picker.Item label="Select Box" value="" color="gray" />
            {selectedBoxes.map((box, index) => (
              <Picker.Item key={index} label={box.name} value={box.name} />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Box Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={Boxtype} onValueChange={setBoxtype}>
            <Picker.Item label="Select Season" value="" color="gray" />
            <Picker.Item label="Summer" value="Summer" />
            <Picker.Item label="Spring" value="Spring" />
            <Picker.Item label="Autumn" value="Autumn" />
            <Picker.Item label="Winter" value="Winter" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.addButtonStyle} onPress={addWardrobeItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AssignTags;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8E9D2",
    alignItems: "center",
  },
  topBackground: {
    width: "100%",
    backgroundColor: "#F8E9D2",
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9B673E",
    textAlign: "center",
  },
  wardrobeImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 15,
  },
  tagContainer: {
    backgroundColor: "#9B673E",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  inputLabel: {
    color: "#f8e8d0",
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: "#f8e8d0",
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#9B673E",
  },
  addButtonStyle: {
    backgroundColor: "#f8e8d0",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#9B673E",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#f8e8d0",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  nextButtonText: {
    color: "#9B673E",
    fontSize: 16,
    fontWeight: "bold",
  },
});