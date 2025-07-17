import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// IMPORTANT: Set your computer's local IP address below for real device testing
// Find your IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
const LOCAL_IP = '192.168.1.5'; // <-- CHANGE THIS TO YOUR COMPUTER'S LOCAL IP
const API_URL = Platform.select({
  ios: 'http://localhost:5000/recommend',
  android: __DEV__ ? 'http://10.0.2.2:5000/recommend' : `http://${LOCAL_IP}:5000/recommend`,
  default: `http://${LOCAL_IP}:5000/recommend`,
});

const API_KEYS = {
  OPENCAGE: '0b979ea8731646cca0a9a849b7473299',
  OPENWEATHER: 'b6228a0a719beaaddba4f26d3a50dc0d',
};

const events = [
    'Aqiqa','Chehlum', 'Defence Day', 'Dholak', 'Barat', 'Mangni', 'Mayun', 
    'Mehndi', 'Nikah', 'Pakistan Day', 'Qwali Night', 'Rukhsati', 'Valima Reception', 
    'Walima', 'Graduation Ceremony', 'Independence Day', 'Bismillah Ceremony & First Roza Celebration', 
    'Birth of a Child & Aqiqah Ceremony', 'Business Meetings & Presentations', 
    'Casual Office Days & Work-from-Home', 'Casual Outing | Visiting Friends & Relatives', 
    'Eid-ul-Fitr & Eid-ul-Adha', 'Engagement (Mangni)', 'Funeral & Mourning (Janazah & Chehlum)', 
    'Office Parties & Corporate Events', 'School Admission Ceremony'
];

const dressTypes = ['Formal', 'Casual'];

// Reusable Dropdown Component
const CustomDropdown = ({ icon, label, placeholder, items, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setIsOpen(true)}>
        <Ionicons name={icon} size={22} color="rgba(255,255,255,0.7)" style={styles.icon} />
        <Text style={[styles.inputText, !selectedValue && styles.placeholderText]}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <ScrollView>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const SelectionScreen = ({ navigation }) => {
  const [cityInput, setCityInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [dressTypeInput, setDressTypeInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [genderInput, setGenderInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);

  const fetchCityCoordinates = async (city) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${API_KEYS.OPENCAGE}`);
      if (response.data.results?.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        fetchWeather(lat, lng);
      } else {
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching location:', error.message);
      setWeather(null);
    }
  };

  useEffect(() => {
    if (cityInput.trim().length < 3) {
        setWeather(null);
        return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchCityCoordinates(cityInput.trim()), 800);
    return () => clearTimeout(debounceTimeout.current);
  }, [cityInput]);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEYS.OPENWEATHER}`);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setWeather({ description: response.data.weather[0].description, temperature: response.data.main.temp });
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      setWeather(null);
    }
  };

  const handleGenerate = async () => {
    if (!cityInput || !genderInput || !eventInput || !timeInput || !dressTypeInput) {
      Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please fill all the fields to continue.' });
      return;
    }
    setIsLoading(true);
    try {
      // Correctly access the temperature from the weather state object
      const temperature = weather ? Math.round(weather.temperature) : '25';

      const payload = {
        event: eventInput,
        outfit: dressTypeInput,
        time: timeInput,
        gender: genderInput,
        weather: String(temperature), // Ensure weather is sent as a string
      };

      console.log('Sending payload to API:', JSON.stringify(payload, null, 2));

      const response = await axios.post(API_URL, payload);

      // Check if the response is OK and data is a non-empty array
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        navigation.navigate('RecommendationScreen', { recommendations: response.data });
      } else {
        // Handle cases where backend returns an empty array or an error message
        const message = response.data?.error || 'We couldn\'t find recommendations for this criteria.';
        Toast.show({ type: 'info', text1: 'No Results', text2: message });
      }
    } catch (error) {
      // Differentiate between server errors and network errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("API Server Error:", JSON.stringify(error.response.data, null, 2));
        const errorMessage = error.response.data?.error || 'An unknown server error occurred. Please check if the backend server is running and reachable.';
        Toast.show({ type: 'error', text1: 'Server Error', text2: errorMessage });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("API Network Error:", error.request);
        Toast.show({ type: 'error', text1: 'Network Error', text2: 'Could not connect to the server. Please check your connection and make sure the backend is running.' });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request Setup Error:', error.message);
        Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Your Look</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weather By Location</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={22} color="rgba(255,255,255,0.7)" style={styles.icon} />
              <TextInput
                style={styles.inputText}
                placeholder="Enter your city"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={cityInput}
                onChangeText={setCityInput}
              />
            </View>
            {weather && (
                <Text style={styles.weatherText}>
                    {`Weather: ${weather.description}, ${Math.round(weather.temperature)}°C`}
                </Text>
            )}
          </View>

          <CustomDropdown
            icon="person-outline"
            label="Gender"
            placeholder="Select your gender"
            items={['Male', 'Female']}
            selectedValue={genderInput}
            onSelect={setGenderInput}
          />
          <CustomDropdown
            icon="calendar-outline"
            label="Event Name"
            placeholder="Select an event"
            items={events}
            selectedValue={eventInput}
            onSelect={setEventInput}
          />
          <CustomDropdown
            icon="time-outline"
            label="Time"
            placeholder="Select time"
            items={['Day', 'Night']}
            selectedValue={timeInput}
            onSelect={setTimeInput}
          />
          <CustomDropdown
            icon="shirt-outline"
            label="Outfit Type"
            placeholder="Select an Outfit type"
            items={dressTypes}
            selectedValue={dressTypeInput}
            onSelect={setDressTypeInput}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleGenerate} disabled={isLoading} style={({ pressed }) => [styles.generateButton, pressed && styles.buttonPressed]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.generateButtonText}>Generate</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
  },
  weatherText: {
      color: 'rgba(255,255,255,0.8)',
      marginTop: 8,
      marginLeft: 5,
      fontSize: 14,
  },
  footer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  generateButton: {
    backgroundColor: '#C4704F',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2c2c2e',
    borderRadius: 15,
    width: '85%',
    maxHeight: '60%',
    padding: 10,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SelectionScreen;
