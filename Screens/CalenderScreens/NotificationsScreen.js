import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { getDatabase, ref, onValue, remove, get, push, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationService from '../../services/NotificationService';
import BottomNav from '../../components/BottomNav';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState({});
  const database = getDatabase();

  useEffect(() => {
    // Fetch events data
    const eventsRef = ref(database, 'events');
    const eventsUnsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        setEvents(snapshot.val());
      }
    });

    // Fetch notifications data
    const notificationsRef = ref(database, 'notifications');
    const notificationsUnsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.entries(notificationsData).map(([id, notification]) => ({
          id,
          ...notification
        }));
        
        // Sort by creation time (newest first)
        notificationsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(notificationsArray);
      } else {
        setNotifications([]);
      }
    });

    return () => {
      eventsUnsubscribe();
      notificationsUnsubscribe();
    };
  }, []);

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await remove(ref(database, `notifications/${notificationId}`));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const getEventName = (eventId) => {
    return events[eventId]?.eventName || 'Unknown Event';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.eventName}>{getEventName(item.eventId)}</Text>
          <Text style={styles.notificationMessage}>
            {item.message || `Your ${getEventName(item.eventId)} event is just around the corner. Please make sure your outfit is ready on time.`}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color="rgba(255,255,255,0.3)" />
      <Text style={styles.emptyText}>No Notifications</Text>
      <Text style={styles.emptySubText}>You'll see event reminders here when they're triggered.</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingBottom: 65, backgroundColor: '#2c1d1a' }}>
      <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 48 }} />
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyNotifications}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#C4704F',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});