import { AppText } from '@/components/app/app-text';
import { Radius, makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Course } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface CourseCardProps {
  course: Course;
  index?: number;
  bookmarked: boolean;
  onPress: () => void;
  onToggleBookmark: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CourseCardComponent({
  course,
  index = 0,
  bookmarked,
  onPress,
  onToggleBookmark,
}: CourseCardProps) {
  const { colors } = useAppTheme();
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(0.985, { damping: 14, stiffness: 180 });
    })
    .onUpdate((event) => {
      rotateY.value = interpolate(event.translationX, [-60, 60], [-6, 6]);
      rotateX.value = interpolate(event.translationY, [-60, 60], [6, -6]);
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 850 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedPressable
        accessible
        accessibilityLabel={`Open ${course.title}`}
        entering={FadeInUp.duration(420).delay(index * 40)}
        onPress={onPress}
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          makeShadow(colors.shadow, 14),
        ]}
      >
        <View style={[styles.glow, { backgroundColor: colors.glow }]} />
        <Image source={{ uri: course.image }} style={styles.cover} contentFit="cover" transition={180} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.levelBadge, { backgroundColor: colors.surfaceRaised }]}>
              <AppText variant="caption" tone="accent">
                {course.level}
              </AppText>
            </View>
            <Pressable
              accessible
              accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              hitSlop={12}
              onPress={onToggleBookmark}
            >
              <MaterialIcons
                color={bookmarked ? colors.accentAlt : colors.textSoft}
                name={bookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
              />
            </Pressable>
          </View>

          <View style={styles.copy}>
            <AppText variant="headline">{course.title}</AppText>
            <AppText variant="caption" tone="soft">
              {course.subtitle}
            </AppText>
            <AppText numberOfLines={2} tone="muted">
              {course.description}
            </AppText>
          </View>

          <View style={styles.metaGrid}>
            <MetaPill icon="timer" label={`${course.durationMinutes} min`} />
            <MetaPill icon="menu-book" label={`${course.lessonCount} lessons`} />
            <MetaPill icon="star" label={course.rating.toFixed(1)} />
          </View>

          <View style={styles.footer}>
            <View style={styles.instructor}>
              <Image source={{ uri: course.instructor.avatar }} style={styles.avatar} contentFit="cover" />
              <View style={styles.instructorCopy}>
                <AppText variant="caption">{course.instructor.name}</AppText>
                <AppText variant="caption" tone="soft">
                  {course.instructor.expertise}
                </AppText>
              </View>
            </View>
            <View>
              <AppText variant="caption" tone="soft">
                Progress
              </AppText>
              <AppText variant="headline" tone="accent">
                {course.progress}%
              </AppText>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </GestureDetector>
  );
}

function MetaPill({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.metaPill, { backgroundColor: colors.surfaceMuted }]}>
      <MaterialIcons color={colors.accent} name={icon} size={16} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: 18,
    overflow: 'hidden',
  },
  glow: {
    height: 120,
    left: 24,
    opacity: 0.45,
    position: 'absolute',
    top: -48,
    width: 120,
    borderRadius: 120,
  },
  cover: {
    height: 210,
    width: '100%',
  },
  content: {
    gap: 18,
    padding: 18,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copy: {
    gap: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  instructor: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  instructorCopy: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
});

export const CourseCard = React.memo(CourseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.bookmarked === nextProps.bookmarked &&
    prevProps.index === nextProps.index
  );
});
