import { AppLoader } from '@/components/app/app-loader';
import { AppText } from '@/components/app/app-text';
import { CourseCard } from '@/components/app/course-card';
import { ProgressBar } from '@/components/app/progress-bar';
import { SectionHeader } from '@/components/app/section-header';
import { StatCard } from '@/components/app/stat-card';
import { makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFeaturedCoursesQuery, useInfiniteCoursesQuery } from '@/hooks/useApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useNetwork } from '@/hooks/useNetwork';
import { catalogApi } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import CatalogPageStyles from '@/styles/CatalogPageStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LegendList } from '@legendapp/list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable,
  RefreshControl,
  ScrollView,
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
  const [productImage, setProductImage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(searchText);
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const styles = useMemo(() => CatalogPageStyles(), []);


  useEffect(() => {

    const getProductImage = async () => {
      try {
        const response: any = await catalogApi.getProductImage();
        console.log("Product image response:", response);
        // setProductImage(response);

      } catch (error) {
        console.error("Error fetching product image:", error);
      }
    }

    getProductImage();

  }, [])
  useEffect(() => {
    if (catalogQuery?.courses) {
      catalogQuery?.courses?.forEach((course) => syncBookmarkedCourse(course));
    }
  }, [catalogQuery.courses, syncBookmarkedCourse]);

  const filteredCourses = useMemo(() => {
    if (!catalogQuery?.courses || catalogQuery.courses.length === 0) {
      return [];
    }

    if (!deferredSearch) {
      return catalogQuery.courses;
    }

    const query = deferredSearch.toLowerCase();
    return catalogQuery.courses.filter((course) => {
      // Safely check course properties
      if (!course?.title || !course?.description || !course?.category) {
        return false;
      }

      return (
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      );
    });
  }, [deferredSearch, catalogQuery?.courses]);

  const averageProgress = useMemo(() => {
    if (!progressMap || Object.keys(progressMap).length === 0) {
      return 0;
    }

    const values = Object.values(progressMap);
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, item) => {
      const percent = typeof item?.completionPercent === 'number' ? item.completionPercent : 0;
      return sum + percent;
    }, 0);

    return Math.round(total / values.length);
  }, [progressMap]);

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
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? 'padding' : "height"}>
        <LegendList
          contentContainerStyle={styles.contentContainer}
          data={filteredCourses}
          recycleItems={true}
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
                  <MaterialIcons
                    color="#FFFFFF"
                    name={isConnected ? "bolt" : "cloud-off"}
                    size={18}
                  />
                  <AppText variant="eyebrow" tone="inverse">
                    {isConnected ? 'System Online (Synced with FreeAPI)' : 'Offline Mode'}
                  </AppText>
                </View>

                <AppText variant="display" tone="inverse">
                  What will you master today?
                </AppText>

                <AppText tone="inverse">
                  {isConnected
                    ? 'Infinite FreeAPI pages, cached images, offline bookmarks, and progress-aware course cards tuned for a premium learning flow.'
                    : 'Using cached content. Reconnect to access new courses.'}
                </AppText>

                <View style={styles.statGrid}>
                  <StatCard icon="library-books" label="Courses loaded" value={String(catalogQuery.courses?.length ?? 0)} containerStyles={styles.customStackGrid} />
                  <StatCard icon="bookmark" label="Saved" value={String(bookmarks?.length ?? 0)} containerStyles={styles.customStackGrid} />
                  <StatCard icon="insights" label="Average progress" value={`${averageProgress ?? 0}%`} containerStyles={styles.customStackGrid} />
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
                    placeholder="Search by title or category"
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

              {featuredQuery.isPending ? (
                <View style={styles.featuredLoading}>
                  <ActivityIndicator color={colors.accent} />
                </View>
              ) : featuredQuery.courses && featuredQuery.courses.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredStrip}>
                  <View style={styles.featuredRow}>
                    {featuredQuery.courses.map((course) => {
                      // Safely access course properties
                      if (!course?.id || !course?.title) {
                        return null;
                      }

                      return (
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
                          {course.image && (
                            <Image
                              source={{ uri: course.image }}
                              style={styles.featuredImage}
                              contentFit="cover"
                            />
                          )}
                          <View style={styles.featuredCopy}>
                            <AppText variant="headline">{course.title}</AppText>
                            <AppText variant="caption" tone="muted">
                              {course.instructor?.name ?? 'Unknown Instructor'}
                            </AppText>
                            {typeof course.progress === 'number' && (
                              <ProgressBar value={course.progress} />
                            )}
                            <View style={styles.featuredMeta}>
                              <AppText variant="caption" tone="accent">
                                {course.level ?? 'Intermediate'}
                              </AppText>
                              <AppText variant="caption" tone="muted">
                                {course.lessonCount ?? 0} lessons
                              </AppText>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : (
                <View
                  style={[
                    styles.emptyFeatured,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MaterialIcons color={colors.accent} name="image-not-supported" size={28} />
                  <AppText variant="headline">No featured courses available</AppText>
                  <AppText tone="muted" style={styles.centerText}>
                    {isConnected
                      ? 'Featured courses will load soon.'
                      : 'Reconnect to download featured courses.'}
                  </AppText>
                </View>
              )}

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
            console.log("[Pagination Debug]", {
              hasNextPage: catalogQuery.hasNextPage,
              isFetchingNextPage: catalogQuery.isFetchingNextPage,
              currentPagesLoaded: catalogQuery.data?.pages.length,
              totalCoursesLoaded: filteredCourses.length,
              isPending: catalogQuery.isPending,
              isError: catalogQuery.isError,
              error: catalogQuery.error,
            });

            if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
              // console.log("[Pagination] Fetching next page...");
              void catalogQuery.fetchNextPage();
            } else if (!catalogQuery.hasNextPage) {
              // console.log("[Pagination] No more pages available");
            } else if (catalogQuery.isFetchingNextPage) {
              // console.log("[Pagination] Already fetching next page");
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
