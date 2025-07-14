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
import { doc, getDoc, updateDoc, getDocs, collection, query, where, addDoc } from "firebase/firestore";
import { UserContext } from "../context/UserContext";

export default function ClothingDetailsForm({ image, wardrobeId, boxName }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};
  const { user } = useContext(UserContext);
  const userId = user?.uid;


  const [wardrobeOptions, setWardrobeOptions] = useState([]);
  const [boxOptions, setBoxOptions] = useState([]);

  const [selectedWardrobe, setSelectedWardrobe] = useState(wardrobeId || "");
  const [selectedBox, setSelectedBox] = useState(boxName || item?.selectedBox || "");
  const [clothingType, setClothingType] = useState(item?.clothingType || "");
  const [outfitType, setOutfitType] = useState(item?.outfitType || "Casual");

  const [loading, setLoading] = useState(true);
  const [customClothingType, setCustomClothingType] = useState("");
  
  const [Detail, setDetail] = useState(item?.Detail || "");
  const [Colour, setColour] = useState(item?.Colour || "");

  const [showCustomField, setShowCustomField] = useState(true);
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

  // Box to clothing type mapping
  const boxToClothingTypes = {
    "Pants": ["Pant", "Trouser", "Jeans"],
    "Shirts": ["Shirt", "T-Shirt", "Kurta"],
    "Shoes": ["Shoe", "Sandal", "Sneaker"],
    "Frocks": ["Frock", "Maxi"],
    "Shalwar Kameez": ["Shalwar Kameez"],
    "Jackets": ["Jacket", "Coat", "Blazer"],
    // Add more mappings as needed
  };

  const clothingTypeOptions = selectedBox && boxToClothingTypes[selectedBox]
    ? [...boxToClothingTypes[selectedBox], "custom"]
    : ["Shirt", "Pant", "Shalwar Kameez", "Frocks", "Shoe", "Jacket", "custom"];

  useEffect(() => {
    if (selectedBox && boxToClothingTypes[selectedBox]) {
      setClothingType(boxToClothingTypes[selectedBox][0] || "");
    } else {
      setClothingType("");
    }
  }, [selectedBox]);

  useEffect(() => {
    if (selectedBox && clothingType && clothingType !== 'custom') {
      const allowedTypes = boxToClothingTypes[selectedBox];
      if (allowedTypes && !allowedTypes.includes(clothingType)) {
        Alert.alert(

          "Invalid Selection",
          `You can't select "${clothingType}" for the "${selectedBox}" box. Please choose a matching clothing type.`,
          [{ text: "OK", onPress: () => setClothingType(allowedTypes[0] || "") }]
        );
      }
    }
  }, [clothingType, selectedBox]);

  useEffect(() => {
    const fetchWardrobes = async () => {
      if (wardrobeId) {
        setLoading(false);
        return;
      }
      if (!userId) return;
      setLoading(true);
      try {
        const q = query(collection(db, "wardrobes"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const wardrobes = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const activeWardrobes = wardrobes.filter(w => w.isActive);
        setWardrobeOptions(activeWardrobes);
      } catch (error) {
        console.error("Error fetching wardrobes: ", error);
        Alert.alert("Error", "Could not fetch wardrobes.");
      } finally {
        setLoading(false);
      }
    };
    fetchWardrobes();
  }, [userId, wardrobeId]);

  useEffect(() => {
    const fetchBoxes = async () => {
      if (boxName) return;
      if (!selectedWardrobe) {
        setBoxOptions([]);
        return;
      }

      const selectedW = wardrobeOptions.find((w) => w.id === selectedWardrobe);
      if (selectedW && selectedW.labels) {
        setBoxOptions(selectedW.labels);
      } else if (selectedWardrobe) {
        try {
          const wardrobeDoc = await getDoc(doc(db, "wardrobes", selectedWardrobe));
          if (wardrobeDoc.exists()) {
            const wardrobeData = wardrobeDoc.data();
            setBoxOptions(wardrobeData.labels || []);
          }
        } catch (error) {
          console.error("Error fetching single wardrobe for boxes: ", error);
        }
      }
    };
    fetchBoxes();
  }, [selectedWardrobe, wardrobeOptions, boxName]);

  const handleSave = async () => {
    if (!selectedWardrobe || !selectedBox || !clothingType || !outfitType || !stuff) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    // Strict check: Only allow correct clothing type for selected box
    const allowedTypes = boxToClothingTypes[selectedBox];
    if (allowedTypes && !allowedTypes.includes(clothingType) && clothingType !== 'custom') {
      Alert.alert(
        "Invalid Clothing Type",
        `Please select a valid clothing type for the "${selectedBox}" box. Allowed types are: ${allowedTypes.join(", ")}.`
      );
      return;
    }

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

    console.log("Saving clothing data:", JSON.stringify({ wardrobeId: selectedWardrobe, ...clothingData }, null, 2));

    try {
      const wardrobeDocId = selectedWardrobe;

      if (item && item.id) {
        await updateDoc(doc(db, "wardrobes", wardrobeDocId, "items", item.id), clothingData);
      } else {
        await addDoc(collection(db, "wardrobes", wardrobeDocId, "items"), clothingData);
      }

      Alert.alert("Success", `Clothing item ${item ? "updated" : "saved"} successfully!`, [
        {
          text: "OK",
          onPress: () => {
            if (wardrobeId && boxName) {
              navigation.goBack();
            } else {
              navigation.navigate("HomeScreen");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error saving clothing item:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleAddCustomClothingType = () => {
    if (customClothingType && !outfitType.includes(customClothingType)) {
      setOutfitType([...outfitType, customClothingType]);
      setShowCustomField(false);
      setCustomClothingType("");
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
          {!wardrobeId && (
            <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
              <Picker selectedValue={selectedWardrobe} onValueChange={setSelectedWardrobe} style={styles.picker} mode="dropdown">
                <Picker.Item label="Select Wardrobe" value="" />
                {wardrobeOptions.map((wardrobe) => (
                  <Picker.Item key={wardrobe.id} label={wardrobe.name || wardrobe.wardrobeName || 'Unnamed Wardrobe'} value={wardrobe.id} />
                ))}
              </Picker>
            </View>
          )}

          {boxName ? (
            <View style={styles.staticBoxContainer}>
              <Text style={styles.staticBoxText}>Box: {boxName}</Text>
            </View>
          ) : (
            <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
              <Picker selectedValue={selectedBox} onValueChange={setSelectedBox} style={styles.picker} mode="dropdown" enabled={!!selectedWardrobe}>
                <Picker.Item label="Select Box" value="" />
                {boxOptions.map((box, index) => (
                  <Picker.Item key={index} label={box} value={box} />
                ))}
              </Picker>
            </View>
          )}

          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={clothingType} onValueChange={setClothingType} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Clothing Type" value="" />
              {clothingTypeOptions.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          {clothingType === "custom" && showCustomField && (
            <View style={styles.customInputContainer}>
              <TextInput
                placeholder="Enter custom clothing type"
                value={customClothingType}
                onChangeText={setCustomClothingType}
                style={styles.customTextInput}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddCustomClothingType}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

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

          <View style={styles.pickerContainer}>
            <TextInput
              placeholder="Enter Colour"
              value={Colour}
              onChangeText={setColour}
              style={styles.input}
            />
          </View>

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

          <View style={[styles.pickerContainer, Platform.OS === "ios" && styles.iosPicker]}>
            <Picker selectedValue={stuff} onValueChange={setStuff} style={styles.picker} mode="dropdown">
              <Picker.Item label="Select Stuff" value="" />
              {stuffOptions.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>

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
  staticBoxContainer: {
    width: "85%",
    height: 50,
    justifyContent: "center",
    paddingLeft: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#9B673E",
  },
  staticBoxText: {
    fontSize: 16,
    color: "#333",
  },
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
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    color: '#333',
  },
  customInputContainer: {
    flexDirection: 'row',
    width: '85%',
    marginVertical: 6,
    alignItems: 'center',
  },
  customTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9B673E',
    borderRadius: 8,
    backgroundColor: '#FFF',
    height: 50,
    paddingLeft: 10,
    marginRight: 10, // Add space between input and button
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
