import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../config/firebaseConfig";
import { doc, setDoc, updateDoc, getDocs, collection, query, where, addDoc } from "firebase/firestore";
import { UserContext } from "../context/UserContext";

export default function ClothingDetailsForm({ image }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};
  const { user } = useContext(UserContext);
  const userId = user?.uid;

  const [wardrobeOptions, setWardrobeOptions] = useState([]);
  const [boxOptions, setBoxOptions] = useState([]);

  const [selectedWardrobe, setSelectedWardrobe] = useState("");
  const [selectedBox, setSelectedBox] = useState(item?.selectedBox || "");
  const [clothingType, setClothingType] = useState(item?.clothingType || "Shirt");
  const [outfitType, setOutfitType] = useState(item?.outfitType || "Casual");

  const [loading, setLoading] = useState(true);
  const [customClothingType, setCustomClothingType] = useState("");  // For custom clothing input
  const [Detail, setDetail] = useState("");  
  const [Colour, setColour] = useState(""); // Allow user to input color

  const [showCustomField, setShowCustomField] = useState(true); // State to manage custom field visibility
  const [stuff, setStuff] = useState(item?.stuff || "");

  const stuffOptions = [
    "Cotton – کاٹن / سوتی کپڑا",
    "Silk – سلک / ریشم",
    "Wool – وول / اون",
    "Linen – لینن / باریک کپڑا",
    "Polyester – پالئیسٹر",
    "Rayon – رے اون / نیم قدرتی ریشم",
    "Nylon – نائلون",
    "Spandex / Lycra – اسپینڈکس / لائکرا (لچکدار کپڑا)",
    "Acrylic – ایکریلک",
    "Denim – ڈینم (جینز والا کپڑا)",
    "Satin – ساٹن / چمکیلا نرم کپڑا",
    "Velvet – ویلوٹ / مخمل",
    "Georgette – جارجٹ / ہلکا جھری دار کپڑا",
    "Chiffon – شیفون / باریک نرم کپڑا",
    "Organza – آرگنزا / سخت چمکیلا کپڑا",
    "Net – نیٹ / جالی دار کپڑا",
    "Crepe – کریپ / جھری دار کپڑا",
    "Lawn – لان / نرم گرمیوں والا کپڑا",
    "Khaddar – کھدر / ہاتھ سے بُنا ہوا کپڑا",
    "Cambric – کیمبرک / نرم اور مضبوط سوتی کپڑا",
    "Voile – وائل / باریک ہلکا کپڑا",
    "Fleece – فلیس / گرم نرم کپڑا",
    "Tulle – ٹُل / باریک نیٹ کپڑا",
    "Jersey – جرسی / کھنچنے والا نرم کپڑا",
    "Jute – جوٹ / بورا نما کپڑا",
    "Cashmere – کشمیری اون / قیمتی نرم کپڑا",
    "Pashmina – پشمینہ / اعلیٰ قسم کی اون",
    "Tencel – ٹینسل / ماحول دوست نرم کپڑا",
    "Modal – موڈل / ریشم جیسا نرم کپڑا",
    "Leather (Genuine / Faux) – لیدر / چمڑا (اصلی یا نقلی)",
  ];

  // Fetch Wardrobes
  useEffect(() => {
    const fetchWardrobes = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const q = query(collection(db, "wardrobes"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const wardrobes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setWardrobeOptions(wardrobes);
      } catch (error) {
        console.error("Error fetching wardrobes: ", error);
        Alert.alert("Error", "Could not fetch wardrobes.");
      } finally {
        setLoading(false);
      }
    };
    fetchWardrobes();
  }, [userId]);

  // Save or Update in Firestore
  const handleSave = async () => {
    if (!selectedWardrobe || !selectedBox || !clothingType || !outfitType || !stuff) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    console.log("Saving clothing data:", JSON.stringify({ wardrobeId: selectedWardrobe, ...clothingData }, null, 2));

    const clothingData = {
      imageUrl: image || item?.imageUrl || "",
      clothingType,
      outfitType,
      Detail,
      Colour,
      selectedBox,
      stuff,
      timestamp: new Date(),
    };

    try {
      const wardrobeId = selectedWardrobe;

      if (item && item.id) {
        await updateDoc(
          doc(db, "wardrobes", wardrobeId, "items", item.id),
          clothingData
        );
      } else {
        const clothingRef = collection(db, "wardrobes", wardrobeId, "items");
        await addDoc(clothingRef, clothingData);
      }

      Alert.alert("Success", `Clothing item ${item ? "updated" : "saved"} successfully!`, [
        {
          text: "OK",
          onPress: () => navigation.navigate("HomeScreen"),
        },
      ]);
    } catch (error) {
      console.error("❌ Error saving clothing item:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Fetch Boxes when a wardrobe is selected
  useEffect(() => {
    if (!selectedWardrobe) {
      setBoxOptions([]);
      return;
    }
    const selectedW = wardrobeOptions.find(w => w.id === selectedWardrobe);
    if (selectedW && selectedW.labels) {
      setBoxOptions(selectedW.labels);
    }
  }, [selectedWardrobe, wardrobeOptions]);

  // Function to handle adding custom clothing type
  const handleAddCustomClothingType = () => {
    if (customClothingType && !outfitType.includes(customClothingType)) {
      setOutfitType([...outfitType, customClothingType]); // Add custom clothing type to outfit list
      setShowCustomField(false); // Hide the custom clothing type input field
      setCustomClothingType(""); // Clear input field
    } else {
      Alert.alert("Error", "Please enter a valid custom clothing type.");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#9B673E" />
      ) : (
        <>
          {/* Wardrobe Picker */}
          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={selectedWardrobe} onValueChange={setSelectedWardrobe} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Wardrobe" value="" />
              {wardrobeOptions.map((wardrobe) => (
                <Picker.Item key={wardrobe.id} label={wardrobe.wardrobeName} value={wardrobe.id} />
              ))}
            </Picker>
          </View>

          {/* Box Picker */}
          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={selectedBox} onValueChange={setSelectedBox} style={styles.picker} mode="dropdown" enabled={!!selectedWardrobe}>
              <Picker.Item label="Select Box" value="" />
              {boxOptions.map((box, index) => (
                <Picker.Item key={index} label={box} value={box} />
              ))}
            </Picker>
          </View>

          {/* Clothing Type Picker */}
          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={clothingType} onValueChange={setClothingType} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Clothing Type" value="" />
              <Picker.Item label="Shirt" value="Shirt" />
              <Picker.Item label="Pants" value="Pants" />
              <Picker.Item label="Shalwar Qamiz" value="Shalwar Qamiz" />
              <Picker.Item label="Forks" value="Forks" />
              <Picker.Item label="Shoe" value="Shoe" />
              <Picker.Item label="Jacket" value="Jacket" />
              <Picker.Item label="Custom Clothing Type" value="custom" />
            </Picker>
          </View>

          {/* Custom Clothing Type Input */}
          {clothingType === "custom" && showCustomField && (
            <View style={styles.pickerContainer}>
              <TextInput
                placeholder="Enter custom clothing type"
                value={customClothingType}
                onChangeText={setCustomClothingType}
                style={styles.input}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddCustomClothingType}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Detail Field */}
          {clothingType === "custom" && !showCustomField && (
            <View style={styles.pickerContainer}>
              <TextInput
                placeholder="Enter details"
                value={Detail}
                onChangeText={setDetail}
                style={styles.input}
              />
            </View>
          )}

          {/* Colour Field */}
          <View style={styles.pickerContainer}>
            <TextInput
              placeholder="Enter Colour"
              value={Colour}
              onChangeText={setColour}
              style={styles.input}
            />
          </View>

          {/* Outfit Type Picker */}
          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={outfitType} onValueChange={setOutfitType} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Outfit Type" value="" />
              <Picker.Item label="Casual" value="Casual" />
              <Picker.Item label="Formal" value="Formal" />
              {outfitType.includes(customClothingType) && (
                <Picker.Item label={customClothingType} value={customClothingType} />
              )}
            </Picker>
          </View>

          {/* Stuff Picker */}
          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={stuff} onValueChange={setStuff} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Stuff" value="" />
              {stuffOptions.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.buttonText}>{item ? "Update Clothing Item" : "Save Clothing Item"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  pickerContainer: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#9B673E",
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: "#FFF",
    height: 50,
    justifyContent: "center",
  },
  iosPicker: {
    height: 200,
  },
  input: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#9B673E",
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: "#FFF",
    height: 40,
    paddingLeft: 10,
  },
  addButton: {
    backgroundColor: "#9B673E",
    borderRadius: 8,
    marginVertical: 6,
    padding: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#9B673E",
    width: "80%",
    height: 45,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
});
