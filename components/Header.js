import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBackground}>
        <FontAwesome5 name="user-circle" size={24} color="#4A148C" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconBackground}>
        <MaterialIcons name="favorite" size={24} color="#4A148C" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginVertical: 20,
  },
  iconBackground: { 
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default Header;
