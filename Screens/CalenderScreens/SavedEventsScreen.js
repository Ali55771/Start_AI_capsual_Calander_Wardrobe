import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SectionList,
  Animated,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, onValue, remove, get } from 'firebase/database';
import BottomNav from '../../components/BottomNav';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SavedEventsScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [reminders, setReminders] = useState({});
  const database = getDatabase();

  useEffect(() => {
    const eventsRef = ref(database, 'events');
    const remindersRef = ref(database, 'reminders');

    // Fetch initial reminders
    get(remindersRef).then(snapshot => {
        if (snapshot.exists()) setReminders(snapshot.val());
    });

    const unsubscribe = onValue(eventsRef, snapshot => {
      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        const eventsArray = Object.entries(eventsData).map(([id, data]) => ({ id, ...data }));
        groupAndSetEvents(eventsArray.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setSections([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const groupAndSetEvents = (events) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const groups = events.reduce((acc, event) => {
        const eventDate = new Date(event.date);
        if (eventDate < todayStart) acc.past.push(event);
        else if (eventDate.toDateString() === todayStart.toDateString()) acc.today.push(event);
        else acc.upcoming.push(event);
        return acc;
    }, { upcoming: [], today: [], past: [] });

    const newSections = [];
    if (groups.today.length > 0) newSections.push({ title: 'Today', data: groups.today });
    if (groups.upcoming.length > 0) newSections.push({ title: 'Upcoming', data: groups.upcoming.reverse() });
    if (groups.past.length > 0) newSections.push({ title: 'Past', data: groups.past });
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(newSections);
  };

  const deleteEvent = (eventId) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await remove(ref(database, `events/${eventId}`));
            await remove(ref(database, `reminders/${eventId}`));
            // The onValue listener will automatically update the UI
          } catch (error) {
            Alert.alert('Error', 'Failed to delete event.');
          }
        }},
    ]);
  };

  const renderEventCard = ({ item }) => (
    <Animated.View style={styles.eventCard}>
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <Text style={styles.eventTime}>{`${new Date(item.date).toDateString()} at ${item.startTime}`}</Text>
        {item.description ? <Text style={styles.eventDescription}>{item.description}</Text> : null}
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ReminderScreen', { event: item })}>
          <Ionicons name={reminders[item.id] ? 'alarm' : 'alarm-outline'} size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PlanEventScreen', { event: item })}>
          <Ionicons name="eye-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => deleteEvent(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const NoEventsComponent = () => (
    <View style={styles.noEventsContainer}>
        <Ionicons name="calendar-outline" size={80} color="rgba(255,255,255,0.2)" />
        <Text style={styles.noEventsText}>No Events Yet</Text>
        <Text style={styles.noEventsSubText}>Tap the '+' on the calendar to create one.</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Events</Text>
          <View style={{ width: 48 }} />
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          ListEmptyComponent={NoEventsComponent}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
        />
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDetails: { flex: 1 },
  eventName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  eventTime: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 10 },
  eventDescription: { fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' },
  eventActions: { flexDirection: 'row' },
  actionButton: { marginLeft: 15, padding: 5 },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
  noEventsText: { fontSize: 22, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', marginTop: 20 },
  noEventsSubText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.4)', marginTop: 10 },
});
