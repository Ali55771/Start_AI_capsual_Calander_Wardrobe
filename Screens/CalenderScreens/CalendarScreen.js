import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';

export default function CalendarScreen({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // --- Preserving original calendar logic ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isSelected = dayDate.toDateString() === selectedDate;
      const isToday = dayDate.toDateString() === new Date().toDateString();

      const dayComponent = (
        <Pressable
          key={i}
          style={styles.dayCell}
          onPress={() => setSelectedDate(dayDate.toDateString())}
        >
          <Animated.View style={[styles.dayContent, isSelected && styles.selectedDay]}>
            <Text style={[styles.dayText, isToday && styles.todayText, isSelected && styles.selectedDayText]}>
              {i}
            </Text>
          </Animated.View>
        </Pressable>
      );
      days.push(dayComponent);
    }
    return days;
  };
  // --- End of original logic ---

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SavedEventsScreen')} style={styles.headerButton}>
            <Ionicons name="bookmarks-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Calendar Body */}
        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back-outline" size={28} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward-outline" size={28} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysContainer}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysContainer}>{renderCalendar()}</View>
        </View>

        {/* Floating Action Button */}
        <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateEventScreen')}>
           <LinearGradient colors={['#C4704F', '#A05A3F']} style={styles.fabGradient}>
              <Ionicons name="add-outline" size={32} color="#FFFFFF" />
           </LinearGradient>
        </Pressable>
      </LinearGradient>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  calendarContainer: {
    marginHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 15,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYearText: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: '500' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayContent: { width: '80%', height: '80%', justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  dayText: { color: '#FFFFFF', fontSize: 16 },
  todayText: { fontWeight: 'bold', color: '#C4704F' },
  selectedDay: {
    backgroundColor: '#C4704F',
    shadowColor: '#C4704F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedDayText: { color: '#FFFFFF', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});