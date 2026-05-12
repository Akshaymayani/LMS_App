import { AppButton } from '@/components/app/app-button';
import { AppText } from '@/components/app/app-text';
import { StatCard } from '@/components/app/stat-card';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { DetailRow } from '@/components/DetailRow';
import { makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLogoutAction, useUploadAvatarMutation } from '@/hooks/useApi';
import { persistSession } from '@/services/auth-storage';
import { NotificationService } from '@/services/notifications';
import type { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/authSlice';
import { setNotificationsEnabled } from '@/store/slices/preferencesSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import { profileScreenStyles } from '@/styles/profilePageStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createSelector } from '@reduxjs/toolkit';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const selectUser = (state: RootState) => state.auth.user;
const selectToken = (state: RootState) => state.auth.token;
const selectBookmarkCount = (state: RootState) => state.bookmarks.ids.length;
const selectProgressByCourseId = (state: RootState) => state.progress.byCourseId;

const selectProfileStats = createSelector(
  [selectBookmarkCount, selectProgressByCourseId],
  (bookmarkCount, progressByCourseId) => {
    const progressItems = Object.values(progressByCourseId);
    let totalProgress = 0;
    let activeCourses = 0;

    for (const item of progressItems) {
      totalProgress += item.completionPercent;

      if (item.completionPercent > 0) {
        activeCourses += 1;
      }
    }

    return {
      bookmarkCount,
      activeCourses,
      averageProgress:
        progressItems.length > 0 ? Math.round(totalProgress / progressItems.length) : 0,
    };
  }
);

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const notificationsEnabled = useAppSelector(
    (state) => state.preferences.notificationsEnabled
  );
  const { bookmarkCount, activeCourses, averageProgress } = useAppSelector(selectProfileStats);
  const uploadAvatarMutation = useUploadAvatarMutation();
  const logout = useLogoutAction();
  const styles = profileScreenStyles();

  const displayName = user?.fullName ?? user?.username ?? user?.email ?? 'User';

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText variant="headline">Profile data unavailable</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Sign out', 'Do you want to end this session on the device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleUpdateAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      dispatch(
        showSnackbar({
          message: 'Media access is required to update the profile photo.',
          tone: 'error',
        })
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !token) {
      return;
    }

    const asset = result.assets[0];
    const previewUser = { ...user, avatar: asset.uri };

    // dispatch(updateProfile(previewUser));
    await persistSession({
      accessToken: token,
      user: previewUser,
    });

    try {
      const response = await uploadAvatarMutation.mutateAsync({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      });
      const avatarFromApi = response.data?.avatar?.url?? "";
      const nextUser = {
        ...previewUser,
        avatar: avatarFromApi,
      };

      dispatch(updateProfile(nextUser));
      await persistSession({
        accessToken: token,
        user: nextUser,
      });

      dispatch(
        showSnackbar({
          message: 'Avatar updated successfully.',
          tone: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error instanceof Error ? error.message : 'Avatar upload failed.',
          tone: 'error',
        })
      );
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    dispatch(setNotificationsEnabled(enabled));

    if (!enabled) {
      await NotificationService.cancelScheduledNotifications();
      dispatch(
        showSnackbar({
          message: 'Notifications are turned off.',
          tone: 'success',
        })
      );
      return;
    }

    const hasPermission = await NotificationService.requestPermissions();

    if (!hasPermission) {
      dispatch(setNotificationsEnabled(false));
      dispatch(
        showSnackbar({
          message: 'Notification permission was not granted.',
          tone: 'error',
        })
      );
      return;
    }

    await NotificationService.scheduleReminderNotification();
    await NotificationService.scheduleTestNotification();
    dispatch(
      showSnackbar({
        message: 'Notifications are turned on.',
        tone: 'success',
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={colors.heroGradient}
          locations={[0, 0.56, 1]}
          style={[styles.heroCard, makeShadow(colors.shadow, 18)]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.identityRow}>
              <Image
                source={{
                  uri:
                    user.avatar ??
                    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80',
                }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.identityCopy}>
                <AppText variant="caption" tone="inverse">
                  Personal cockpit
                </AppText>
                <AppText variant="title" tone="inverse">
                  {displayName}
                </AppText>
                <AppText tone="inverse">{user.email}</AppText>
              </View>
            </View>
            <View style={styles.heroActions}>
              <AppButton accessibilityLabel="Change avatar" onPress={handleUpdateAvatar}>
                {uploadAvatarMutation.isPending ? 'Uploading...' : 'Change photo'}
              </AppButton>
              <AppButton
                accessibilityLabel="Sign out"
                onPress={handleLogout}
                variant="danger"
              >
                Logout
              </AppButton>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard icon="bookmark" label="Saved courses" value={String(bookmarkCount)} containerStyles={styles.customStackStyles} />
          <StatCard icon="play-circle-outline" label="Active tracks" value={String(activeCourses)} containerStyles={styles.customStackStyles} />
          <StatCard icon="auto-graph" label="Average progress" value={`${averageProgress}%`} containerStyles={styles.customStackStyles} />
        </View>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            makeShadow(colors.shadow, 10),
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialIcons color={colors.accent} name="palette" size={22} />
            </View>
            <View style={styles.panelCopy}>
              <AppText variant="headline">Theme system</AppText>
              <AppText tone="muted">
                Switch between system, light, and dark modes instantly across the app.
              </AppText>
            </View>
          </View>
          <ThemeToggle />
        </View>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            makeShadow(colors.shadow, 10),
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialIcons color={colors.accent} name="settings" size={22} />
            </View>
            <View style={styles.panelCopy}>
              <AppText variant="headline">Preferences</AppText>
              <AppText tone="muted">Manage notifications and the launcher icon.</AppText>
            </View>
          </View>

          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingsCopy}>
              <AppText>Notifications</AppText>
              <AppText variant="caption" tone="muted">
                Receive learning reminders on this device.
              </AppText>
            </View>
            <Switch
              accessibilityLabel="Toggle notifications"
              onValueChange={handleNotificationToggle}
              thumbColor={notificationsEnabled ? colors.accent : colors.surfaceRaised}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              value={notificationsEnabled}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/app-icon' as never)}
            style={({ pressed }) => [
              styles.settingsRow,
              styles.settingsButton,
              {
                opacity: pressed ? 0.76 : 1,
              },
            ]}
          >
            <View style={styles.settingsCopy}>
              <AppText>App icons</AppText>
              <AppText variant="caption" tone="muted">
                Choose the light or dark launcher icon.
              </AppText>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={24} />
          </Pressable>
        </View>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            makeShadow(colors.shadow, 10),
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialIcons color={colors.accent} name="person-outline" size={22} />
            </View>
            <View style={styles.panelCopy}>
              <AppText variant="headline">Account snapshot</AppText>
              <AppText tone="muted">SecureStore keeps your active token and account identity safe on device.</AppText>
            </View>
          </View>
          <DetailRow label="Username" value={user.username ?? 'Not provided'} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={user.role ?? 'Learner'} />
        </View>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginTop: 24,
            },
            makeShadow(colors.shadow, 10),
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialIcons color={colors.accent} name="speed" size={22} />
            </View>
            <View style={styles.panelCopy}>
              <AppText variant="headline">Performance Testing</AppText>
              <AppText tone="muted">Compare list implementations rendering the infinite scroll catalog.</AppText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/list-test/flatlist')}
            style={({ pressed }) => [
              styles.settingsRow,
              styles.settingsButton,
              { opacity: pressed ? 0.76 : 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.settingsCopy}>
              <AppText>FlatList Result</AppText>
              <AppText variant="caption" tone="muted">React Native's built-in FlatList</AppText>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={24} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/list-test/flashlist')}
            style={({ pressed }) => [
              styles.settingsRow,
              styles.settingsButton,
              { opacity: pressed ? 0.76 : 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.settingsCopy}>
              <AppText>FlashList Result</AppText>
              <AppText variant="caption" tone="muted">Shopify's high-performance FlashList</AppText>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={24} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/list-test/legendlist')}
            style={({ pressed }) => [
              styles.settingsRow,
              styles.settingsButton,
              { opacity: pressed ? 0.76 : 1 },
            ]}
          >
            <View style={styles.settingsCopy}>
              <AppText>LegendList Result</AppText>
              <AppText variant="caption" tone="muted">LegendApp's LegendList</AppText>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={24} />
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

