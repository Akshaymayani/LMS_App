import { AppButton } from '@/components/app/app-button';
import { AppLoader } from '@/components/app/app-loader';
import { AppText } from '@/components/app/app-text';
import { ProgressBar } from '@/components/app/progress-bar';
import { makeShadow, Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCourseDetailQuery } from '@/hooks/useApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAppDispatch } from '@/store/hooks';
import { openCourse } from '@/store/slices/progressSlice';
import { courseDetailsStyles } from '@/styles/courseDetailsStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailsScreen() {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const courseId = Number(rawId);
  const { course, error, isPending, refetch } = useCourseDetailQuery(courseId);
  const { isBookmarked, syncBookmarkedCourse, toggleBookmark } = useBookmarks();
  const styles = courseDetailsStyles();

  useEffect(() => {
    if (!course) {
      return;
    }

    dispatch(
      openCourse({
        courseId: course.id,
        totalTasks: course.lessonCount,
      })
    );
    syncBookmarkedCourse(course);
  }, [course?.id, dispatch, syncBookmarkedCourse]);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Course Details',
          }}
        />
        <AppLoader label="Loading course studio..." />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Course Details',
          }}
        />
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialIcons color={colors.accent} name="error-outline" size={28} />
          <AppText variant="headline">We could not load that course</AppText>
          <AppText tone="muted">{error instanceof Error ? error.message : 'Please try again.'}</AppText>
          <AppButton accessibilityLabel="Retry loading course" onPress={() => void refetch()}>
            Retry
          </AppButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: course.title,
          headerBackTitle: 'Courses',
        }}
      />
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroShell, makeShadow(colors.shadow, 16)]}>
          <Image source={{ uri: course.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(3,10,18,0.1)', 'rgba(3,10,18,0.82)']}
            style={styles.heroOverlay}
          />
          <Pressable
            accessibilityLabel={isBookmarked(course.id) ? 'Remove bookmark' : 'Add bookmark'}
            onPress={() => {
              void toggleBookmark(course);
            }}
            style={styles.bookmarkButton}
          >
            <MaterialIcons
              color="#FFFFFF"
              name={isBookmarked(course.id) ? 'bookmark' : 'bookmark-border'}
              size={24}
            />
          </Pressable>

          <View style={styles.heroContent}>
            <View style={[styles.levelPill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <AppText variant="caption" tone="inverse">
                {course.level}
              </AppText>
            </View>
            <AppText variant="display" tone="inverse">
              {course.title}
            </AppText>
            <AppText tone="inverse">{course.spotlight}</AppText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MetaCard icon="star" label="Rating" value={course.rating.toFixed(1)} />
          <MetaCard icon="menu-book" label="Lessons" value={String(course.lessonCount)} />
          <MetaCard icon="timer" label="Duration" value={`${course.durationMinutes}m`} />
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
          <AppText variant="headline">Progress snapshot</AppText>
          <ProgressBar value={course.progress} />
          <View style={styles.progressRow}>
            <AppText tone="muted">Completion</AppText>
            <AppText variant="headline" tone="accent">
              {course.progress}%
            </AppText>
          </View>
          <AppText tone="muted">{course.description}</AppText>
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
          <AppText variant="headline">Instructor</AppText>
          <View style={styles.instructorRow}>
            <Image source={{ uri: course.instructor.avatar }} style={styles.instructorAvatar} contentFit="cover" />
            <View style={styles.instructorCopy}>
              <AppText variant="headline">{course.instructor.name}</AppText>
              <AppText tone="muted">{course.instructor.expertise}</AppText>
              <AppText tone="soft">{course.instructor.bio}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.actionStack}>
          <AppButton
            accessibilityLabel="Open live lesson"
            onPress={() => router.push(`/webview/${course.id}`)}
          >
            Start live lesson
          </AppButton>
          <AppButton
            accessibilityLabel="Toggle bookmark"
            onPress={() => {
              void toggleBookmark(course);
            }}
            variant="secondary"
          >
            {isBookmarked(course.id) ? 'Remove bookmark' : 'Save for offline'}
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          alignItems: 'flex-start',
          borderRadius: Radius.lg,
          borderWidth: 1,
          flex: 1,
          gap: 8,
          padding: 16,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        makeShadow(colors.shadow, 8),
      ]}
    >
      <MaterialIcons color={colors.accent} name={icon} size={22} />
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="headline">{value}</AppText>
    </View>
  );
}


