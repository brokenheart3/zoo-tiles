// src/services/notificationService.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/navigationRef';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export type NotificationType = 
  | 'dailyReminder'
  | 'weeklyChallenge'
  | 'promoAlerts'
  | 'soundEffects'
  | 'vibration'
  | 'badgeCount';

// Check if notification type is enabled
const isNotificationEnabled = async (type: NotificationType): Promise<boolean> => {
  const value = await AsyncStorage.getItem(type);
  return value === null ? true : value === 'true';
};

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for notifications');
    return false;
  }

  return true;
};

// ======================
// DAILY REMINDER (9 AM)
// ======================
export const scheduleDailyReminder = async () => {
  const enabled = await isNotificationEnabled('dailyReminder');
  if (!enabled) return;

  // First cancel any existing daily reminders
  await cancelDailyReminder();

  // Get next 9 AM
  const trigger = new Date();
  trigger.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM, schedule for tomorrow
  if (trigger.getTime() < Date.now()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🐾 Daily Animal Challenge",
      body: "Your daily puzzle is waiting! Complete it to continue your streak.",
      data: { screen: 'DailyChallenge' },
      sound: true,
      badge: 1,
    },
    trigger: trigger as any,
  });
  
  console.log('✅ Daily reminder scheduled for', trigger.toString());
};

export const cancelDailyReminder = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  let cancelled = 0;
  
  for (const notification of scheduled) {
    if (notification.content.title?.includes("Daily Animal Challenge")) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      cancelled++;
    }
  }
  
  if (cancelled > 0) {
    console.log(`❌ Cancelled ${cancelled} daily reminder(s)`);
  }
};

// ======================
// WEEKLY CHALLENGE (Sunday 10 AM)
// ======================
export const scheduleWeeklyReminder = async () => {
  const enabled = await isNotificationEnabled('weeklyChallenge');
  if (!enabled) return;

  // First cancel any existing weekly reminders
  await cancelWeeklyReminder();

  // Get next Sunday at 10 AM
  const trigger = new Date();
  const day = trigger.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  
  trigger.setDate(trigger.getDate() + daysUntilSunday);
  trigger.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌟 New Weekly Challenge",
      body: "A new weekly expedition is available! Can you beat it?",
      data: { screen: 'WeeklyChallenge' },
      sound: true,
      badge: 1,
    },
    trigger: trigger as any,
  });
  
  console.log('✅ Weekly reminder scheduled for', trigger.toString());
};

export const cancelWeeklyReminder = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  let cancelled = 0;
  
  for (const notification of scheduled) {
    if (notification.content.title?.includes("Weekly Challenge")) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      cancelled++;
    }
  }
  
  if (cancelled > 0) {
    console.log(`❌ Cancelled ${cancelled} weekly reminder(s)`);
  }
};

// ======================
// PROMOTIONAL NOTIFICATIONS
// ======================
export const schedulePromoNotification = async (title: string, body: string, delayInHours: number = 24) => {
  const enabled = await isNotificationEnabled('promoAlerts');
  if (!enabled) return;

  const trigger = new Date();
  trigger.setHours(trigger.getHours() + delayInHours);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎁 ${title}`,
      body: body,
      data: { screen: 'Home' },
      sound: true,
      badge: 1,
    },
    trigger: trigger as any,
  });
  
  console.log(`✅ Promo scheduled: ${title}`);
};

export const cancelPromoNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  let cancelled = 0;
  
  for (const notification of scheduled) {
    if (notification.content.title?.includes("🎁") || 
        notification.content.title?.includes("Special") ||
        notification.content.title?.includes("Offer")) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      cancelled++;
    }
  }
  
  if (cancelled > 0) {
    console.log(`❌ Cancelled ${cancelled} promo notification(s)`);
  }
};

// ======================
// TEST NOTIFICATION
// ======================
export const sendTestNotification = async () => {
  const soundEnabled = await isNotificationEnabled('soundEffects');
  const vibrationEnabled = await isNotificationEnabled('vibration');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Test Notification",
      body: "This is a test notification from Zoo Tiles!",
      data: { screen: 'Home' },
      sound: soundEnabled,
      vibrate: vibrationEnabled ? [0, 250, 250, 250] : undefined,
      badge: 1,
    },
    trigger: null, // Send immediately
  });
  
  console.log('✅ Test notification sent');
};

// ======================
// CHALLENGE ENDING SOON
// ======================
export const scheduleChallengeEndingSoon = async (challengeId: string, endTime: Date) => {
  const enabled = await isNotificationEnabled('dailyReminder');
  if (!enabled) return;

  // Schedule 1 hour before challenge ends
  const trigger = new Date(endTime);
  trigger.setHours(trigger.getHours() - 1);

  // Only schedule if the trigger time is in the future
  if (trigger.getTime() > Date.now()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Challenge Ending Soon",
        body: "Your daily challenge ends in 1 hour! Don't lose your streak.",
        data: { screen: 'DailyChallenge', challengeId },
        sound: true,
        badge: 1,
      },
      trigger: trigger as any,
    });
    console.log('✅ Challenge ending notification scheduled');
  }
};

// ======================
// BADGE COUNT
// ======================
export const setBadgeCount = async (count: number) => {
  const enabled = await isNotificationEnabled('badgeCount');
  if (!enabled) return;
  
  await Notifications.setBadgeCountAsync(count);
  console.log(`✅ Badge count set to ${count}`);
};

// ======================
// HANDLE NOTIFICATION RESPONSE
// ======================
const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  const { screen, challengeId } = response.notification.request.content.data as {
    screen?: 'DailyChallenge' | 'WeeklyChallenge' | 'Home';
    challengeId?: string;
  };
  
  console.log('🔔 Notification tapped:', { screen, challengeId });
  
  // Navigate based on the screen
  if (screen === 'DailyChallenge') {
    navigate('Main');
    // You can use a global state or event emitter here
  } else if (screen === 'WeeklyChallenge') {
    navigate('Main');
  } else if (screen === 'Home') {
    navigate('Main');
  }
};

// ======================
// CANCEL ALL NOTIFICATIONS
// ======================
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('✅ All notifications cancelled');
};

// ======================
// GET SCHEDULED NOTIFICATIONS
// ======================
export const getScheduledNotifications = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`📋 ${notifications.length} scheduled notifications`);
  
  // Log details for debugging
  notifications.forEach((n, i) => {
    console.log(`   ${i+1}. ${n.content.title} - Trigger: ${JSON.stringify(n.trigger)}`);
  });
  
  return notifications;
};

// ======================
// INITIALIZE NOTIFICATIONS
// ======================
export const initializeNotifications = async () => {
  console.log('🔔 Initializing notifications...');
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('❌ Notification permissions not granted');
    return;
  }

  // Set up Android notification channels
  if (Platform.OS === 'android') {
    await setupNotificationChannels();
  }

  // Cancel any existing notifications and reschedule based on preferences
  await cancelAllNotifications();
  
  // Schedule notifications based on current preferences
  const settings = await getNotificationSettings();
  
  if (settings.dailyReminder) {
    await scheduleDailyReminder();
  }
  if (settings.weeklyChallenge) {
    await scheduleWeeklyReminder();
  }
  // Promo notifications are scheduled manually when needed

  // Set up notification listeners
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('🔔 Notification received:', notification.request.content.title);
  });

  console.log('✅ Notifications initialized successfully');

  // Return cleanup function
  return () => {
    responseSubscription.remove();
    receivedSubscription.remove();
  };
};

// ======================
// GET NOTIFICATION SETTINGS
// ======================
export const getNotificationSettings = async () => {
  return {
    dailyReminder: await isNotificationEnabled('dailyReminder'),
    weeklyChallenge: await isNotificationEnabled('weeklyChallenge'),
    promoAlerts: await isNotificationEnabled('promoAlerts'),
    soundEffects: await isNotificationEnabled('soundEffects'),
    vibration: await isNotificationEnabled('vibration'),
    badgeCount: await isNotificationEnabled('badgeCount'),
  };
};

// ======================
// UPDATE NOTIFICATION SETTINGS
// ======================
export const updateNotificationSettings = async () => {
  const settings = await getNotificationSettings();
  
  // Cancel all first
  await cancelAllNotifications();
  
  // Re-schedule only the ones that are enabled
  if (settings.dailyReminder) {
    await scheduleDailyReminder();
  }
  if (settings.weeklyChallenge) {
    await scheduleWeeklyReminder();
  }
  
  console.log('🔄 Notification settings updated');
};

// ======================
// ANDROID CHANNELS
// ======================
const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
    
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
    });
    
    await Notifications.setNotificationChannelAsync('promos', {
      name: 'Promotions',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9800',
      sound: 'default',
    });
    
    console.log('✅ Android notification channels created');
  }
};