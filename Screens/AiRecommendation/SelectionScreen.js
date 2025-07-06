import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Pressable,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_KEYS = {
  OPENCAGE: '0b979ea8731646cca0a9a849b7473299',
  OPENWEATHER: 'b6228a0a719beaaddba4f26d3a50dc0d',
};

const events = [
  'Birth of a Child & Aqiqah Ceremony',
  'Bismillah Ceremony & First Roza Celebration',
  'School Admission Ceremony',
  'Graduation Ceremony',
  'Engagement (Mangni)',
  'Mayun',
  'Mehndi',
  'Nikah',
  'Rukhsati',
  'Valima Reception',
  'Funeral & Mourning (Janazah & Chehlum)',
  'Pakistan Day',
  'Independence Day',
  'Defence Day',
  'Eid-ul-Fitr & Eid-ul-Adha',
  'Business Meetings & Presentations',
  'Office Parties & Corporate Events',
  'Casual Office Days & Work-from-Home',
  'Casual Outing | Visiting Friends & Relatives',
];

const dressTypes = ['Formal', 'Casual'];

const AnimatedInput = ({ label, placeholder, value, onChangeText, icon, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.inputGroup, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="rgba(255, 255, 255, 0.6)" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </Animated.View>
  );
};

const CustomDropdown = ({ label, placeholder, value, data, onSelect, icon, delay = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
  }, []);

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    if (!isOpen) {
      setIsOpen(true);
    }
    Animated.timing(listAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isOpen) {
        setIsOpen(false);
      }
    });
  };

  const containerStyle = [
    styles.inputGroup,
    {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    },
    isOpen && { zIndex: 1000 },
  ];

  const listContainerStyle = {
    opacity: listAnim,
    transform: [
      {
        scale: listAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={toggleDropdown}>
        <Ionicons name={icon} size={20} color="rgba(255, 255, 255, 0.6)" />
        <Text style={[styles.input, { color: value ? '#fff' : 'rgba(255, 255, 255, 0.4)' }]}>
          {value || placeholder}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
      {isOpen && (
        <Animated.View style={[styles.dropdownList, listContainerStyle]}>
          <ScrollView nestedScrollEnabled={true}>
            {data.map(item => (
              <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { onSelect(item); toggleDropdown(); }}>
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const SelectionScreen = ({ navigation }) => {
  const [cityInput, setCityInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [dressTypeInput, setDressTypeInput] = useState('');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const debounceTimeout = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const fetchCityCoordinates = async (city) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${API_KEYS.OPENCAGE}`);
      if (response.data.results?.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setLocation({ latitude: lat, longitude: lng });
        fetchWeather(lat, lng);
      } else {
        setLocation(null);
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching location:', error.message);
      setLocation(null);
      setWeather(null);
    }
  };

  useEffect(() => {
    if (cityInput.trim().length < 3) {
      if (location) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setLocation(null);
        setWeather(null);
      }
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchCityCoordinates(cityInput.trim()), 800);
    return () => clearTimeout(debounceTimeout.current);
  }, [cityInput]);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEYS.OPENWEATHER}`);
      setWeather({ description: response.data.weather[0].description, temperature: response.data.main.temp });
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      setWeather(null);
    }
  };

  const handleGenerate = () => {
    if (!cityInput || !eventInput || !dressTypeInput) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all fields to get a recommendation.' });
      return;
    }
    navigation.navigate('RecommendationScreen', { city: cityInput, event: eventInput, dressType: dressTypeInput, weather });
  };

  const onPressIn = () => Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <Text style={styles.title}>Create Your Look</Text>
              <AnimatedInput label="Location" placeholder="Enter your city" value={cityInput} onChangeText={setCityInput} icon="location-outline" delay={100} />
              {location && (
                <Animated.View style={styles.mapContainer}>
                  <MapView style={styles.map} region={{ ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
                    <Marker coordinate={location} title={cityInput} pinColor="#C4704F" />
                  </MapView>
                  {weather && (
                    <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.weatherContainer}>
                      <Text style={styles.weatherText}>{`${weather.description}, ${Math.round(weather.temperature)}°C`}</Text>
                    </LinearGradient>
                  )}
                </Animated.View>
              )}
              <CustomDropdown label="Event Type" placeholder="Select an event" value={eventInput} data={events} onSelect={setEventInput} icon="calendar-outline" delay={200} />
              <CustomDropdown label="Dress Code" placeholder="Select a dress type" value={dressTypeInput} data={dressTypes} onSelect={setDressTypeInput} icon="shirt-outline" delay={300} />
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleGenerate}>
              <Animated.View style={[styles.generateButton, { transform: [{ scale: buttonScale }] }]}>
                <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.generateButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.generateButtonText}>Generate</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  container: { paddingHorizontal: 25, paddingTop: 60 },
  listContentContainer: { flexGrow: 1, paddingBottom: 20 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 100 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 30 },
  inputGroup: { marginBottom: 20, zIndex: 1 },
  label: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, marginBottom: 10, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  mapContainer: { borderRadius: 15, overflow: 'hidden', marginTop: 10, height: 180, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  map: { ...StyleSheet.absoluteFillObject },
  weatherContainer: { position: 'absolute', top: 0, left: 0, right: 0, padding: 15 },
  weatherText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    width: '100%',
    backgroundColor: '#3a2a28',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 250,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 2000,
  },
  dropdownItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  dropdownItemText: { color: '#fff', fontSize: 16 },
  footer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    backgroundColor: '#2c1d1a' 
  },
  generateButton: { borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  generateButtonGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 12 },
  generateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SelectionScreen;
