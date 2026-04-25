import { NotificationService } from '@/services/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  syncBookmarkedCourse as syncBookmarkedCourseAction,
  toggleBookmark as toggleBookmarkAction,
} from '@/store/slices/bookmarksSlice';
import type { Course } from '@/types';
import { useCallback } from 'react';

export function useBookmarks() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector((state) => state.bookmarks.ids);
  const entities = useAppSelector((state) => state.bookmarks.entities);

  const toggleBookmark = useCallback(
    async (course: Course) => {
      const alreadyBookmarked = ids.includes(course.id);
      const nextCount = alreadyBookmarked ? ids.length - 1 : ids.length + 1;

      dispatch(toggleBookmarkAction(course));

      if (!alreadyBookmarked && nextCount >= 5) {
        await NotificationService.scheduleBookmarkNotification(nextCount);
      }
    },
    [dispatch, ids]
  );

  const syncBookmarkedCourse = useCallback(
    (course: Course) => {
      dispatch(syncBookmarkedCourseAction(course));
    },
    [dispatch]
  );

  return {
    bookmarks: ids,
    bookmarkedCourses: ids.map((id) => entities[id]).filter(Boolean),
    toggleBookmark,
    syncBookmarkedCourse,
    isBookmarked: (courseId: number) => ids.includes(courseId),
  };
}
