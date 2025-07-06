import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SaveAvatar({ skinTone, faceShape, height, width }) {
  const saveAvatar = async () => {
    const avatarData = { skinTone, faceShape, height, width };
    await AsyncStorage.setItem('avatarSettings', JSON.stringify(avatarData));
    alert('Avatar Saved!');
  };

  const loadAvatar = async () => {
    const savedData = await AsyncStorage.getItem('avatarSettings');
    if (savedData) {
      const { skinTone, faceShape, height, width } = JSON.parse(savedData);
      console.log({ skinTone, faceShape, height, width });
      alert('Avatar Loaded!');
    } else {
      alert('No saved avatar found.');
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Button title="Save Avatar" onPress={saveAvatar} />
      <Button title="Load Avatar" onPress={loadAvatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
  },
});
