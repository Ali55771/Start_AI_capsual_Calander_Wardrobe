import * as Notifications from 'expo-notifications';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app } from '../config/firebaseConfig';
import { registerBackgroundNotificationTask, unregisterBackgroundNotificationTask } from './BackgroundNotificationHandler';

const database = getDatabase(app);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification listeners
  async initialize() {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Register background task
    await registerBackgroundNotificationTask();

    // Set up notification listeners
    this.notificationListener = Notifications.addNotificationReceivedListener(this.handleNotificationReceived);
    this.responseListener = Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
  }

  // Handle when notification is received (app in foreground)
  handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    this.saveNotificationToDatabase(notification.request.content.data);
  }

  // Handle when user taps on notification
  handleNotificationResponse = (response) => {
    console.log('Notification response:', response);
    const data = response.notification.request.content.data;
    
    // Navigate to appropriate screen based on notification type
    if (data.eventId) {
      // Navigate to event details or notifications screen
      // This will be handled by the app navigation
    }
  }

  // Save notification to database
  async saveNotificationToDatabase(notificationData) {
    try {
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

      console.log('Notification saved to database');
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }

  // Schedule a notification for an event
  async scheduleEventNotification(eventId, eventName, notificationTime, message) {
    try {
      const trigger = new Date(notificationTime);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: message || `⏰ Your event "${eventName}" is approaching! Get ready.`,
          sound: true,
          data: {
            eventId,
            eventName,
            message,
            type: 'event_reminder'
          },
        },
        trigger,
      });

      console.log('Event notification scheduled for:', trigger);
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Test notification function (for development)
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification to verify the system is working!',
          sound: true,
          data: {
            eventId: 'test',
            eventName: 'Test Event',
            message: 'Test notification',
            type: 'test'
          },
        },
        trigger: { seconds: 5 }, // Send after 5 seconds
      });

      console.log('Test notification scheduled');
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
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
    
    // Unregister background task
    unregisterBackgroundNotificationTask();
  }
}

export default new NotificationService(); 