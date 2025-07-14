import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, push } from 'firebase/database';
import { app } from '../../config/firebaseConfig';
import BottomNav from '../../components/BottomNav';

const database = getDatabase(app);

export default function CreateEventScreen({ navigation }) {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Set the minimum selectable date to the start of today
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  // --- Preserving original Firebase logic ---
  const validateInputs = () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name.');
      return false;
    }
    return true;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Ensure the selected date is not in the past
      if (selectedDate < minDate) {
        Alert.alert('Invalid Date', 'Please select today or a future date.');
        setDate(minDate); // Reset to today if an invalid date is selected
      } else {
        setDate(selectedDate);
      }
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const now = new Date();
      // Check if the selected date is the same as today's date
      const isToday = date.toDateString() === now.toDateString();

      // If the event is for today, the time must be in the future
      if (isToday) {
        const selectedHour = selectedTime.getHours();
        const selectedMinute = selectedTime.getMinutes();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
          Alert.alert('Invalid Time', 'Please select a time in the future.');
          return; // Do not update the time, keeping the previous valid time
        }
      }
      setStartTime(selectedTime);
    }
  };

  const saveEventToFirebase = async () => {
    if (!validateInputs()) return;
    try {
      const eventRef = ref(database, 'events');
      await push(eventRef, {
        eventName,
        date: date.toISOString().split('T')[0],
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Event saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };
  // --- End of original logic ---

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Event</Text>
              <View style={{ width: 48 }} />{/* Spacer */}
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={eventName}
                onChangeText={setEventName}
              />
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.inputText}>{`Date: ${date.toLocaleDateString()}`}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.inputText}>{`Time: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (optional)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={minDate}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
              />
            )}

            {/* Save Button */}
            <Pressable onPress={saveEventToFirebase}>
              <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Event</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerButton: { padding: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  formContainer: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  inputText: { color: '#FFFFFF', fontSize: 16 },
  descriptionInput: { height: 120, textAlignVertical: 'top' },
  saveButton: {
    margin: 25,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});