import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const AvatarOption = ({ navigation }) => {
  return (
    <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#754c29" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AvatarCustomizationScreen')}>
        <Text style={styles.buttonText}>Create Your Avatar</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Customize and style yourself digitally.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2DFCE', // Dark navy background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default AvatarOption;
