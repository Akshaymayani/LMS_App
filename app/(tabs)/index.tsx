import { AppLoader } from '@/components/app/app-loader';
import { AppText } from '@/components/app/app-text';
import { CourseCard } from '@/components/app/course-card';
import { ProgressBar } from '@/components/app/progress-bar';
import { SectionHeader } from '@/components/app/section-header';
import { StatCard } from '@/components/app/stat-card';
import { Radius, makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFeaturedCoursesQuery, useInfiniteCoursesQuery } from '@/hooks/useApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useNetwork } from '@/hooks/useNetwork';
import { useAppSelector } from '@/store/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LegendList } from '@legendapp/list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoursesScreen() {
  const { colors } = useAppTheme();
  const { isConnected } = useNetwork();
  const { bookmarks, isBookmarked, syncBookmarkedCourse, toggleBookmark } = useBookmarks();
  const featuredQuery = useFeaturedCoursesQuery(4);
  const catalogQuery = useInfiniteCoursesQuery(10);
  const [searchText, setSearchText] = useState('');
  const deferredSearch = useDeferredValue(searchText);
  const progressMap = useAppSelector((state) => state.progress.byCourseId);

  useEffect(() => {
    catalogQuery.courses.forEach((course) => syncBookmarkedCourse(course));
  }, [catalogQuery.courses, syncBookmarkedCourse]);

  const filteredCourses = deferredSearch
    ? catalogQuery.courses.filter((course) => {
        const query = deferredSearch.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
        );
      })
    : catalogQuery.courses;

  const averageProgress =
    Object.values(progressMap).length > 0
      ? Math.round(
          Object.values(progressMap).reduce((sum, item) => sum + item.completionPercent, 0) /
            Object.values(progressMap).length
        )
      : 0;

  const refreshCatalog = async () => {
    await Promise.all([featuredQuery.refetch(), catalogQuery.refetch()]);
  };

  if (catalogQuery.isPending && featuredQuery.isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppLoader label="Curating the catalog..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios"? 'padding': "height"}>
      <LegendList
        contentContainerStyle={styles.contentContainer}
        data={filteredCourses}
        estimatedItemSize={360}
        keyExtractor={(item) => `course-${item.id}`}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons color={colors.accent} name="travel-explore" size={28} />
            <AppText variant="headline">
              {deferredSearch ? 'No matching courses yet' : 'No catalog items available'}
            </AppText>
            <AppText tone="muted" style={styles.centerText}>
              Try a different keyword or refresh the feed once the network is back.
            </AppText>
          </View>
        }
        ListFooterComponent={
          catalogQuery.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <View style={styles.footerSpace} />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <LinearGradient
              colors={colors.heroGradient}
              locations={[0, 0.56, 1]}
              style={[styles.hero, makeShadow(colors.shadow, 18)]}
            >
              <View style={styles.heroPill}>
                <MaterialIcons color="#FFFFFF" name="bolt" size={18} />
                <AppText variant="eyebrow" tone="inverse">
                  System Online (Synced with FreeAPI)
                </AppText>
              </View>

              <AppText variant="display" tone="inverse">
                What will you master today?
              </AppText>

              <AppText tone="inverse">
                Infinite FreeAPI pages, cached images, offline bookmarks, and progress-aware course
                cards tuned for a premium learning flow.
              </AppText>

              <View style={styles.statGrid}>
                <StatCard icon="library-books" label="Courses loaded" value={String(catalogQuery.courses.length)} />
                <StatCard icon="bookmark" label="Saved" value={String(bookmarks.length)} />
                <StatCard icon="insights" label="Average progress" value={`${averageProgress}%`} />
              </View>

              <View
                style={[
                  styles.searchShell,
                  {
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    borderColor: 'rgba(255,255,255,0.22)',
                  },
                ]}
              >
                <MaterialIcons color="#FFFFFF" name="search" size={22} />
                <TextInput
                  accessibilityLabel="Search courses"
                  onChangeText={(value) => {
                    startTransition(() => {
                      setSearchText(value);
                    });
                  }}
                  placeholder="Search by title, category, or vibe"
                  placeholderTextColor="rgba(255,255,255,0.74)"
                  style={styles.searchInput}
                  value={searchText}
                />
                {!isConnected ? (
                  <View style={styles.offlineBadge}>
                    <AppText variant="caption" tone="inverse">
                      Offline
                    </AppText>
                  </View>
                ) : null}
              </View>
            </LinearGradient>

            <SectionHeader eyebrow="Featured" title="Spotlight tracks" />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredStrip}>
              <View style={styles.featuredRow}>
                {featuredQuery.courses.map((course) => (
                  <Pressable
                    key={course.id}
                    accessible
                    accessibilityLabel={`Open featured course ${course.title}`}
                    onPress={() => router.push(`/course/${course.id}`)}
                    style={[
                      styles.featuredCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      makeShadow(colors.shadow, 10),
                    ]}
                  >
                    <Image source={{ uri: course.image }} style={styles.featuredImage} contentFit="cover" />
                    <View style={styles.featuredCopy}>
                      <AppText variant="headline">{course.title}</AppText>
                      <AppText variant="caption" tone="muted">
                        {course.instructor.name}
                      </AppText>
                      <ProgressBar value={course.progress} />
                      <View style={styles.featuredMeta}>
                        <AppText variant="caption" tone="accent">
                          {course.level}
                        </AppText>
                        <AppText variant="caption" tone="muted">
                          {course.lessonCount} lessons
                        </AppText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <SectionHeader
              eyebrow="Explore"
              title={deferredSearch ? `Results for "${deferredSearch}"` : 'All courses'}
              actionLabel={catalogQuery.hasNextPage ? 'More' : undefined}
              onPressAction={() => {
                if (catalogQuery.hasNextPage) {
                  void catalogQuery.fetchNextPage();
                }
              }}
            />
          </View>
        }
        onEndReached={() => {
          if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
            void catalogQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={catalogQuery.isRefetching || featuredQuery.isRefetching}
            tintColor={colors.accent}
            onRefresh={() => {
              refreshCatalog();
            }}
          />
        }
        renderItem={({ item, index }) => (
          <CourseCard
            bookmarked={isBookmarked(item.id)}
            course={item}
            index={index}
            onPress={() => router.push(`/course/${item.id}`)}
            onToggleBookmark={() => {
              toggleBookmark(item);
            }}
          />
        )}
      />
      </KeyboardAvoidingView>
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
  headerWrap: {
    gap: 22,
    marginBottom: 20,
  },
  hero: {
    borderRadius: Radius.xl,
    gap: 18,
    overflow: 'hidden',
    padding: 22,
  },
  heroPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  searchShell: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 54,
  },
  offlineBadge: {
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featuredStrip: {
    marginHorizontal: -4,
  },
  featuredRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 4,
  },
  featuredCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    width: 260,
  },
  featuredImage: {
    height: 148,
    width: '100%',
  },
  featuredCopy: {
    gap: 10,
    padding: 16,
  },
  featuredMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 12,
    marginTop: 18,
    padding: 24,
  },
  centerText: {
    textAlign: 'center',
  },
  footerLoader: {
    paddingBottom: 120,
    paddingTop: 12,
  },
  footerSpace: {
    height: 120,
  },
});
