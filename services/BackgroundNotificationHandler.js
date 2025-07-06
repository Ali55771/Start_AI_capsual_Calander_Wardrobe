import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getDatabase, ref, push, set } from 'firebase/database';
import { app } from '../config/firebaseConfig';

const database = getDatabase(app);

// Define the background task
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }

  if (data) {
    const { notification } = data;
    
    // Save notification to database
    saveNotificationToDatabase(notification.request.content.data);
  }
});

// Save notification to database
async function saveNotificationToDatabase(notificationData) {
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

    console.log('Background notification saved to database');
  } catch (error) {
    console.error('Error saving background notification to database:', error);
  }
}

// Register the background task
export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('Background notification task registered');
  } catch (error) {
    console.error('Failed to register background notification task:', error);
  }
}

// Unregister the background task
export async function unregisterBackgroundNotificationTask() {
  try {
    await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('Background notification task unregistered');
  } catch (error) {
    console.error('Failed to unregister background notification task:', error);
  }
} 