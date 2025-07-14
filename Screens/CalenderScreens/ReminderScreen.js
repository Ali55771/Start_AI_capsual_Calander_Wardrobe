import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, remove, set } from 'firebase/database';
import BottomNav from '../../components/BottomNav';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ReminderScreen({ navigation, route }) {
  const [reminders, setReminders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const database = getDatabase();
  const { event } = route.params;

  useEffect(() => {
    const remindersRef = ref(database, `reminders/${event.id}`);
    const unsubscribe = onValue(remindersRef, snapshot => {
      const data = snapshot.val();
      const remindersList = data ? Object.entries(data).map(([id, r]) => ({ id, ...r })) : [];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setReminders(remindersList);
    });
    return () => unsubscribe();
  }, [event.id]);

  const toggleReminder = (reminderId, currentStatus) => {
    const reminderRef = ref(database, `reminders/${event.id}/${reminderId}/enabled`);
    set(reminderRef, !currentStatus);
  };

  const deleteReminder = (reminderId) => {
    const reminderRef = ref(database, `reminders/${event.id}/${reminderId}`);
    remove(reminderRef);
  };

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminders</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('AddAlarmScreen', { event })} style={styles.headerButton}>
              <Ionicons name="add-outline" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.headerButton}>
              <Ionicons name={editMode ? 'close-outline' : 'create-outline'} size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.eventCard}>
            <Text style={styles.eventName}>{event.eventName}</Text>
            <Text style={styles.eventTime}>{`${new Date(event.date).toDateString()} at ${event.startTime}`}</Text>
          </View>

          {reminders.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Your Reminders</Text>
              {reminders.map(reminder => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <Text style={styles.reminderTime}>{reminder.time}</Text>
                  <View style={styles.reminderActions}>
                    <Switch
                      trackColor={{ false: '#767577', true: '#C4704F' }}
                      thumbColor={reminder.enabled ? '#FFFFFF' : '#f4f3f4'}
                      onValueChange={() => toggleReminder(reminder.id, reminder.enabled)}
                      value={reminder.enabled}
                    />
                    {editMode && (
                      <TouchableOpacity onPress={() => deleteReminder(reminder.id)} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={24} color="#E57373" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.noRemindersContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.noRemindersText}>No reminders set yet.</Text>
              <Text style={styles.noRemindersSubText}>Tap the '+' icon to add one.</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerActions: { flexDirection: 'row' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  eventName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  eventTime: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)', marginTop: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderTime: { color: '#FFFFFF', fontSize: 18, fontWeight: '500' },
  reminderActions: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { marginLeft: 15 },
  noRemindersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  noRemindersText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    marginTop: 20,
  },
  noRemindersSubText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 5,
  },
});