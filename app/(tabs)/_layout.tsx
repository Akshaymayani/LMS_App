import { AppText } from '@/components/app/app-text';
import { HapticTab } from '@/components/haptic-tab';
import { makeShadow, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppSelector } from '@/store/hooks';
import { hasValidAuthSession } from '@/utils/auth-session';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function DynamicHeader({ title }: { title: string }) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <AppText variant="title">{title}</AppText>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const auth = useAppSelector((state) => state.auth);
  const isAuthenticated = hasValidAuthSession(auth);

  if (!auth.hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        header: ({ route }) => {
          const titles: Record<string, string> = {
            index: 'Explore Catalog',
            bookmarks: 'Saved Courses',
            profile: 'Your Profile',
          };
          return <DynamicHeader title={titles[route.name] || 'MyEducation'} />;
        },
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 8,
        },
        tabBarItemStyle: {
          marginTop: 8,
        },
        tabBarStyle: {
          backgroundColor: colors.glass,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.xl,
          height: 76,
          left: 16,
          paddingBottom: 8,
          paddingTop: 2,
          position: 'absolute',
          right: 16,
          bottom: 18,
          ...makeShadow(colors.shadow, 14),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} name="menu-book" size={24} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} name="bookmark" size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} name="person" size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
});
