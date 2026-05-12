import { AppLoader } from '@/components/app/app-loader';
import { CourseCard } from '@/components/app/course-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useInfiniteCoursesQuery } from '@/hooks/useApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { catalogApi } from '@/services/api';
import { LegendList } from '@legendapp/list';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/app/app-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ListTestScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useAppTheme();
  const { isBookmarked, syncBookmarkedCourse, toggleBookmark } = useBookmarks();
  const catalogQuery = useInfiniteCoursesQuery(10);
  const [productImage, setProductImage] = useState<string | null>(null);

  useEffect(() => {
    const getProductImage = async () => {
      try {
        const response = await catalogApi.getProductImage();
        if (response) {
          setProductImage(response);
        }
      } catch (error) {
        console.error("Error fetching product image:", error);
      }
    };
    getProductImage();
  }, []);

  useEffect(() => {
    if (catalogQuery?.courses) {
      catalogQuery.courses.forEach((course) => syncBookmarkedCourse(course));
    }
  }, [catalogQuery.courses, syncBookmarkedCourse]);

  const courses = catalogQuery?.courses || [];

  const handleEndReached = () => {
    if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
      void catalogQuery.fetchNextPage();
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <CourseCard
      bookmarked={isBookmarked(item.id)}
      course={item}
      index={index}
      productImage={productImage}
      enableAnimation={false}
      onPress={() => router.push(`/course/${item.id}`)}
      onToggleBookmark={() => toggleBookmark(item)}
    />
  );

  const renderFooter = () => {
    if (catalogQuery.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    return <View style={styles.footerSpace} />;
  };

  const renderEmpty = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MaterialIcons color={colors.accent} name="travel-explore" size={28} />
      <AppText variant="headline">No catalog items available</AppText>
    </View>
  );

  if (catalogQuery.isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppLoader label="Loading courses..." />
      </SafeAreaView>
    );
  }

  const listTitle = type === 'flatlist' ? 'FlatList Test' : type === 'flashlist' ? 'FlashList Test' : 'LegendList Test';

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: listTitle }} />
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? 'padding' : "height"}>
        <View style={styles.container}>
          {type === 'flatlist' && (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={courses}
              keyExtractor={(item) => `course-${item.id}`}
              renderItem={renderItem}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.6}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
            />
          )}

          {type === 'flashlist' && (
            <FlashList
              contentContainerStyle={styles.listContent}
              data={courses}
              estimatedItemSize={360}
              keyExtractor={(item) => `course-${item.id}`}
              renderItem={renderItem}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.6}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
            />
          )}

          {type === 'legendlist' && (
            <LegendList
              contentContainerStyle={styles.listContent}
              data={courses}
              recycleItems={true}
              estimatedItemSize={360}
              keyExtractor={(item) => `course-${item.id}`}
              renderItem={renderItem}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.6}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpace: {
    height: 48,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
    padding: 32,
  },
});
