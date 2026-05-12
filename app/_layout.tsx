import { AppLoader } from '@/components/app/app-loader';
import { GradientBackdrop } from '@/components/app/gradient-backdrop';
import { NetworkSnackbar } from '@/components/app/network-snackbar';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useNetwork } from '@/hooks/useNetwork';
import { AppProviders } from '@/providers/app-providers';
import { NotificationService } from '@/services/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hasValidAuthSession } from '@/utils/auth-session';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: "https://75cb0cb6b4502f824819ea4e862b1a63@o4511366333464576.ingest.us.sentry.io/4511366372720640",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});





LogBox.ignoreAllLogs(true);

function RootNavigator() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const notificationsEnabled = useAppSelector(
    (state) => state.preferences.notificationsEnabled
  );
  const { colors, navigationTheme, scheme } = useAppTheme();
  const isAuthenticated = hasValidAuthSession(auth);

  // useNetwork();

  useEffect(() => {
    dispatch(hydrateAuth());
    NotificationService.updateLastOpenTime();
  }, [dispatch]);

  useEffect(() => {
    if (!notificationsEnabled) {
      NotificationService.cancelScheduledNotifications();
      return;
    }

    NotificationService.requestPermissions();
    NotificationService.scheduleReminderNotification();
    // NotificationService.scheduleBookmarkNotification();
    NotificationService.scheduleTestNotification();
  }, [notificationsEnabled]);

  if (!auth.hydrated) {
    return (
      <View style={[styles.loadingShell, { backgroundColor: colors.background }]}>
        <GradientBackdrop />
        <AppLoader />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <GradientBackdrop />
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        >
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="course/[id]"
              options={{
                title: 'Course Details',
                headerShown: true,
                headerBackTitle: 'Back',
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="webview/[id]/index"
              options={{
                title: 'Live Lesson',
                headerShown: true,
                headerBackTitle: 'Back',
                // headerBackTitleVisible: true,
              }}
            />
            <Stack.Screen
              name="app-icon"
              options={{
                title: 'App Icon',
                headerShown: true,
                headerBackTitle: 'Profile',
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
            <Stack.Screen
              name="list-test/[type]"
              options={{
                title: 'List Performance',
                headerShown: true,
                headerBackTitle: 'Profile',
              }}
            />
          </Stack.Protected>
        </Stack>
        <NetworkSnackbar />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingShell: {
    flex: 1,
  },
});
