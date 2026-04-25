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
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

function RootNavigator() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { colors, navigationTheme, scheme } = useAppTheme();
  const isAuthenticated = hasValidAuthSession(auth);

  useNetwork();

  useEffect(() => {
    dispatch(hydrateAuth());
    NotificationService.updateLastOpenTime();
    NotificationService.requestPermissions();
    NotificationService.scheduleReminderNotification();
    // NotificationService.scheduleBookmarkNotification();
    NotificationService.scheduleTestNotification();

  }, [dispatch]);

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
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
          </Stack.Protected>
        </Stack>
        <NetworkSnackbar />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingShell: {
    flex: 1,
  },
});
