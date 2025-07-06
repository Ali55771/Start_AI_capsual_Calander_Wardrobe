import React from 'react';
import { View, StyleSheet, Slider } from 'react-native';

export default function Sliders({ setSkinTone, setHeight, setWidth }) {
  return (
    <View style={styles.sliderContainer}>
      {/* Skin Tone Slider */}
      <Slider
        minimumValue={0}
        maximumValue={1}
        onValueChange={(value) => {
          const tone = value < 0.5 ? "#fcd1b1" : "#a87b5a";
          setSkinTone(tone);
        }}
      />
      {/* Height Slider */}
      <Slider
        minimumValue={100}
        maximumValue={200}
        onValueChange={(value) => setHeight(value)}
      />
      {/* Width Slider */}
      <Slider
        minimumValue={50}
        maximumValue={150}
        onValueChange={(value) => setWidth(value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    marginVertical: 10,
    width: '90%',
  },
});
