import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const ActionButtons = () => {
  const buttons = [
    { label: 'Upload your photos', icon: 'camera' },
    { label: 'Create new outfits', icon: 'plus-circle' },
    { label: 'Plan your outfits', icon: 'calendar-alt' },
  ];

  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <TouchableOpacity key={index} style={styles.button}>
          <FontAwesome5 name={button.icon} size={24} color="#4A148C" />
          <Text style={styles.label}>{button.label}</Text>
        </TouchableOpacity>
      ))}
    </View> 
  ); 
};
 
const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#4A148C',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ActionButtons;
