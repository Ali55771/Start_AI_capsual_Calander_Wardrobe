import * as Notifications from 'expo-notifications';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app } from '../config/firebaseConfig';
import { Platform, Alert } from 'react-native';

const database = getDatabase(app);

// Simple notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification listeners
  async initialize() {
    try {
      console.log('Starting notification initialization...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('New permission status:', status);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted:', finalStatus);
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return false;
      }

      console.log('✅ Notification permissions granted');

      // Set up notification listeners
      this.notificationListener = Notifications.addNotificationReceivedListener(this.handleNotificationReceived);
      this.responseListener = Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
      
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }

  // Handle when notification is received (app in foreground)
  handleNotificationReceived = (notification) => {
    console.log('📱 Notification received in foreground:', notification);
    console.log('📱 Notification content:', notification.request.content);
    this.saveNotificationToDatabase(notification.request.content.data);
  }

  // Handle when user taps on notification
  handleNotificationResponse = (response) => {
    console.log('👆 Notification tapped:', response);
    const data = response.notification.request.content.data;
    this.saveNotificationToDatabase(data);
  }

  // Save notification to database
  async saveNotificationToDatabase(notificationData) {
    try {
      console.log('💾 Saving notification to database:', notificationData);
      const notificationsRef = ref(database, 'notifications');
      const newNotificationRef = push(notificationsRef);
      
      await set(newNotificationRef, {
        eventId: notificationData.eventId,
        eventName: notificationData.eventName,
        message: notificationData.message,
        createdAt: new Date().toISOString(),
        isRead: false,
        type: 'event_reminder'
      });

      console.log('✅ Notification saved to database');
    } catch (error) {
      console.error('❌ Error saving notification to database:', error);
    }
  }

  // Send immediate notification for testing
  async sendImmediateNotification() {
    try {
      console.log('🚀 Sending immediate notification...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Your test event is just around the corner. Please make sure your outfit is ready on time.',
          sound: true,
          data: {
            eventId: 'immediate-test',
            eventName: 'Immediate Test Event',
            message: 'Your test event is just around the corner. Please make sure your outfit is ready on time.',
            type: 'immediate-test'
          },
        },
        trigger: null, // Immediate notification
      });

      console.log('✅ Immediate notification sent with ID:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error sending immediate notification:', error);
      return false;
    }
  }

  // Schedule a notification for an event
  async scheduleEventNotification(eventId, eventName, notificationTime, message) {
    try {
      console.log('⏰ Scheduling notification for:', notificationTime);
      const trigger = new Date(notificationTime);
      
      const customMessage = message || `Your ${eventName} event is just around the corner. Please make sure your outfit is ready on time.`;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: customMessage,
          sound: true,
          data: {
            eventId,
            eventName,
            message: customMessage,
            type: 'event_reminder'
          },
        },
        trigger,
      });

      console.log('✅ Event notification scheduled for:', trigger.toLocaleString());
      console.log('✅ Notification ID:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return false;
    }
  }

  // Test notification function (for development)
  async sendTestNotification() {
    try {
      console.log('🧪 Sending test notification...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Your test event is just around the corner. Please make sure your outfit is ready on time.',
          sound: true,
          data: {
            eventId: 'test',
            eventName: 'Test Event',
            message: 'Your test event is just around the corner. Please make sure your outfit is ready on time.',
            type: 'test'
          },
        },
        trigger: { seconds: 5 }, // Send after 5 seconds
      });

      console.log('✅ Test notification scheduled with ID:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return false;
    }
  }

  // Debug function to check scheduled notifications
  async debugScheduledNotifications() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Currently scheduled notifications:', scheduledNotifications);
      return scheduledNotifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check notification permissions
  async checkPermissions() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      console.log('📱 Current permission status:', status);
      return status;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return 'unknown';
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService(); 