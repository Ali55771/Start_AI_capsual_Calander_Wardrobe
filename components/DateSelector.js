import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DateSelector = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {days.map((day, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.day}>{day}</Text>
          <View style={styles.innerCircle}>
            <Text style={styles.date}>{`0${index + 1}`}</Text>
          </View>
        </View>
      ))}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#4A148C',
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 80,
    justifyContent: 'center',
  },
  day: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  innerCircle: {
    marginTop: 5,
    backgroundColor: '#fff', // Light yellow color as per the design
    borderRadius: 25, // Makes it a perfect circle
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 16,
    color: '#4A148C', // Dark text color inside the yellow circle
    fontWeight: 'bold',
  },
});

export default DateSelector;
