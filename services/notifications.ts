import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const LAST_OPEN_KEY = 'last_app_open';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export class NotificationService {
  static async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleBookmarkNotification(bookmarkCount: number) {
    if (bookmarkCount >= 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great Progress!',
          body: `You've bookmarked ${bookmarkCount} courses. Keep learning!`,
        },
        trigger: null, // Show immediately
      });
    }
  }

  static async scheduleReminderNotification() {
    const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);
    if (lastOpen) {
      const lastOpenTime = parseInt(lastOpen);
      const now = Date.now();
      const hoursSinceLastOpen = (now - lastOpenTime) / (1000 * 60 * 60);

      if (hoursSinceLastOpen >= 24) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Come Back to Learn!',
            body: 'It\'s been 24 hours since you last opened the app. Continue your learning journey!',
          },
          trigger: null,
        });
      }
    }
  }

  static async scheduleTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got Scheduled Notification! 📬",
        sound: 'mySoundFile.wav', // Provide ONLY the base filename
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 15,
        channelId: 'new_emails',
      },
    });
  }


  static async updateLastOpenTime() {
    await AsyncStorage.setItem(LAST_OPEN_KEY, Date.now().toString());
  }
}