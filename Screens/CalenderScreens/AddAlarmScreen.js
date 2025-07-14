import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app } from '../../config/firebaseConfig';
import NotificationService from '../../services/NotificationService';

const database = getDatabase(app);
const { width } = Dimensions.get('window');
const ITEM_WIDTH = 70;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export default function AddAlarmScreen({ navigation, route }) {
  const [selectedHour, setSelectedHour] = useState('03');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const { event } = route.params;

  const scrollXHour = useRef(new Animated.Value(0)).current;
  const scrollXMinute = useRef(new Animated.Value(0)).current;

  const handleSaveAlarm = async () => {
    const reminderRef = ref(database, `reminders/${event.id}`);
    const newReminderRef = push(reminderRef);

    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    const minute = parseInt(selectedMinute, 10);

    const eventDate = new Date(event.date);
    const notificationTime = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      hour24,
      minute
    );

    const now = new Date();
    if (notificationTime < now) {
      Alert.alert('Invalid Time', 'Please select a time in the future.');
      return;
    }

    const time = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    try {
      await set(newReminderRef, {
        time,
        enabled: true,
        notificationTime: notificationTime.toISOString(),
      });

      await NotificationService.scheduleEventNotification(
        event.id,
        event.eventName,
        notificationTime,
        `Your ${event.eventName} event is just around the corner. Please make sure your outfit is ready on time.`
      );

      Alert.alert('Success', 'Alarm saved and notification scheduled!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save alarm.');
      console.error(error);
    }
  };

  const renderTimePicker = (data, scrollX, onSelect) => (
    <AnimatedFlatList
      data={data}
      keyExtractor={item => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: ITEM_SPACING }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
      onMomentumScrollEnd={ev => {
        const index = Math.round(ev.nativeEvent.contentOffset.x / ITEM_WIDTH);
        onSelect(data[index]);
      }}
      renderItem={({ item, index }) => {
        const inputRange = [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1.2, 0.8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View style={[styles.timeItem, { transform: [{ scale }], opacity }]}>
            <Text style={styles.timeItemText}>{item}</Text>
          </Animated.View>
        );
      }}
    />
  );

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Alarm</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.timeDisplayContainer}>
        <Text style={styles.timeDisplayText}>{`${selectedHour}:${selectedMinute}`}</Text>
        <View style={styles.periodContainer}>
          <TouchableOpacity
            onPress={() => setSelectedPeriod('AM')}
            style={[styles.periodButton, selectedPeriod === 'AM' && styles.activePeriodButton]}>
            <Text style={[styles.periodText, selectedPeriod === 'AM' && styles.activePeriodText]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedPeriod('PM')}
            style={[styles.periodButton, selectedPeriod === 'PM' && styles.activePeriodButton]}>
            <Text style={[styles.periodText, selectedPeriod === 'PM' && styles.activePeriodText]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Hour</Text>
        {renderTimePicker(hours, scrollXHour, setSelectedHour)}
        <Text style={styles.pickerLabel}>Minute</Text>
        {renderTimePicker(minutes, scrollXMinute, setSelectedMinute)}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAlarm}>
        <Text style={styles.saveButtonText}>Save Alarm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#A0785A', marginTop: 10 }]} onPress={async () => {
        const now = new Date();
        const notificationTime = new Date(now.getTime() + 10000); // 10 seconds from now
        await NotificationService.scheduleEventNotification(
          event.id,
          event.eventName,
          notificationTime,
          'Your test event is just around the corner. Please make sure your outfit is ready on time.'
        );
        Alert.alert('Quick Reminder', 'Notification will appear in 10 seconds!');
      }}>
        <Text style={styles.saveButtonText}>Quick Reminder (10s)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#8B7355', marginTop: 10 }]} onPress={async () => {
        const now = new Date();
        const notificationTime = new Date(now.getTime() + 60000); // 1 minute from now
        await NotificationService.scheduleEventNotification(
          event.id,
          event.eventName,
          notificationTime,
          'Your test event is just around the corner. Please make sure your outfit is ready on time.'
        );
        Alert.alert('1 Minute Test', 'Notification will appear in 1 minute!');
      }}>
        <Text style={styles.saveButtonText}>Test (1 minute)</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: { padding: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  timeDisplayContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timeDisplayText: {
    fontSize: 82,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  periodContainer: {
    flexDirection: 'row',
    marginTop: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  activePeriodButton: {
    backgroundColor: '#C4704F',
  },
  periodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  timeItem: {
    width: ITEM_WIDTH,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeItemText: {
    fontSize: 36,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#C4704F',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 20 : 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});