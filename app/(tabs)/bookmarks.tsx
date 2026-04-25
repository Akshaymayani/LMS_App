import { CourseCard } from '@/components/app/course-card';
import EmptyCard from '@/components/card/EmptyCard';
import HeaderCard from '@/components/card/HeaderCard';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useInfiniteCoursesQuery } from '@/hooks/useApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { LegendList } from '@legendapp/list';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
  const { colors } = useAppTheme();
  const { bookmarks, bookmarkedCourses, isBookmarked, syncBookmarkedCourse, toggleBookmark } = useBookmarks();
  const catalogQuery = useInfiniteCoursesQuery(20);

  useEffect(() => {
    catalogQuery.courses.forEach((course) => syncBookmarkedCourse(course));
  }, [catalogQuery.courses, syncBookmarkedCourse]);

  const courses = useMemo(() => {
    const liveMap = new Map(catalogQuery.courses.map((course) => [course.id, course]));
    return bookmarks
      .map((id) => liveMap.get(id) ?? bookmarkedCourses.find((course) => course.id === id))
      .filter(Boolean);
  }, [bookmarkedCourses, bookmarks, catalogQuery.courses]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <LegendList
        contentContainerStyle={styles.contentContainer}
        data={courses}
        estimatedItemSize={360}
        keyExtractor={(item) => `bookmark-${item.id!}`}
        ListEmptyComponent={EmptyCard}
        ListHeaderComponent={() => <HeaderCard cardSize={courses?.length || 0} />}
        refreshControl={
          <RefreshControl
            refreshing={catalogQuery.isRefetching}
            tintColor={colors.accent}
            onRefresh={() => {
              catalogQuery.refetch();
            }}
          />
        }
        renderItem={({ item, index }) => {
          if(!item) return null;
          return (
            <CourseCard
              bookmarked={isBookmarked(item.id)}
              course={item}
              index={index}
              onPress={() => router.push(`/course/${item.id}`)}
              onToggleBookmark={() => {
                toggleBookmark(item);
              }}
            />
          )
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 128,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  emptyState: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    padding: 24,
  },
  centerText: {
    textAlign: 'center',
  },
});
