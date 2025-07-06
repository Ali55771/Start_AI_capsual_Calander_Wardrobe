// ClothingDetailsScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const fabricOptions = [
    { label: "Select Fabric...", value: "" },
    { label: "Cotton – کاٹن / سوتی کپڑا", value: "Cotton" },
    { label: "Silk – سلک / ریشم", value: "Silk" },
    { label: "Wool – وول / اون", value: "Wool" },
    { label: "Linen – لینن / باریک کپڑا", value: "Linen" },
    { label: "Polyester – پالئیسٹر", value: "Polyester" },
    { label: "Rayon – رے اون / نیم قدرتی ریشم", value: "Rayon" },
    { label: "Nylon – نائلون", value: "Nylon" },
    { label: "Spandex / Lycra – اسپینڈکس / لائکرا", value: "Spandex" },
    { label: "Acrylic – ایکریلک", value: "Acrylic" },
    { label: "Denim – ڈینم", value: "Denim" },
    { label: "Satin – ساٹن / چمکیلا نرم کپڑا", value: "Satin" },
    { label: "Velvet – ویلوٹ / مخمل", value: "Velvet" },
    { label: "Georgette – جارجٹ / ہلکا جھری دار کپڑا", value: "Georgette" },
    { label: "Chiffon – شیفون / باریک نرم کپڑا", value: "Chiffon" },
    { label: "Organza – آرگنزا / سخت چمکیلا کپڑا", value: "Organza" },
    { label: "Net – نیٹ / جالی دار کپڑا", value: "Net" },
    { label: "Crepe – کریپ / جھری دار کپڑا", value: "Crepe" },
    { label: "Lawn – لان / نرم گرمیوں والا کپڑا", value: "Lawn" },
    { label: "Khaddar – کھدر / ہاتھ سے بُنا ہوا کپڑا", value: "Khaddar" },
    { label: "Cambric – کیمبرک / نرم اور مضبوط سوتی کپڑا", value: "Cambric" },
    { label: "Voile – وائل / باریک ہلکا کپڑا", value: "Voile" },
    { label: "Fleece – فلیس / گرم نرم کپڑا", value: "Fleece" },
    { label: "Tulle – ٹُل / باریک نیٹ کپڑا", value: "Tulle" },
    { label: "Jersey – جرسی / کھنچنے والا نرم کپڑا", value: "Jersey" },
    { label: "Jute – جوٹ / بورا نما کپڑا", value: "Jute" },
    { label: "Cashmere – کشمیری اون / قیمتی نرم کپڑا", value: "Cashmere" },
    { label: "Pashmina – پشمینہ / اعلیٰ قسم کی اون", value: "Pashmina" },
    { label: "Tencel – ٹینسل / ماحول دوست نرم کپڑا", value: "Tencel" },
    { label: "Modal – موڈل / ریشم جیسا نرم کپڑا", value: "Modal" },
    { label: "Leather (Genuine / Faux) – لیدر / چمڑا", value: "Leather" },
];

const ClothingDetailsScreen = ({ route }) => {
  const { photoUri } = route.params;
  const [itemName, setItemName] = useState('');
  const [itemColor, setItemColor] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemStuff, setItemStuff] = useState(''); // New state for fabric
  const navigation = useNavigation();

  const handleSaveItem = () => {
    // You can now use itemStuff in your save logic
    console.log({ itemName, itemColor, itemCategory, itemStuff });
    navigation.navigate('WardrobePreview');
  };

  return (
    <View style={styles.container}>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.image} />}
      <TextInput
        placeholder="Enter Item Name"
        value={itemName}
        onChangeText={setItemName}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Item Color"
        value={itemColor}
        onChangeText={setItemColor}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Item Category"
        value={itemCategory}
        onChangeText={setItemCategory}
        style={styles.input}
      />
      
      {/* Fabric Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={itemStuff}
          onValueChange={(itemValue, itemIndex) => setItemStuff(itemValue)}
          style={styles.picker}
          dropdownIconColor="#888"
        >
          {fabricOptions.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <Button title="Save Item" onPress={handleSaveItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {
    height: '100%',
    width: '100%',
  },
});

export default ClothingDetailsScreen;
