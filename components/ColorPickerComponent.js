import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ColorPicker from "react-native-wheel-color-picker";

const ColorPickerComponent = ({ selectedColor, onSelectColor }) => {
  const [color, setColor] = useState(selectedColor || "#C37632");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Color</Text>
      <ColorPicker
        color={color}
        onColorChange={setColor}
        onColorChangeComplete={onSelectColor}
        thumbSize={30}
        sliderSize={30}
        noSnap={true}
        row={false}
      />
      <View style={[styles.colorPreview, { backgroundColor: color }]} />
      <TouchableOpacity style={styles.selectButton} onPress={() => onSelectColor(color)}>
        <Text style={styles.buttonText}>Confirm Color</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#9B673E",
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#000",
  },
  selectButton: {
    backgroundColor: "#9B673E",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ColorPickerComponent;
