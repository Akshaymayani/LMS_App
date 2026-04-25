import type { Course } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BookmarksState {
  ids: number[];
  entities: Record<number, Course>;
}

const initialState: BookmarksState = {
  ids: [],
  entities: {},
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    toggleBookmark(state, action: PayloadAction<Course>) {
      const course = action.payload;

      if (state.ids.includes(course.id)) {
        state.ids = state.ids.filter((id) => id !== course.id);
        delete state.entities[course.id];
        return;
      }

      state.ids = [course.id, ...state.ids];
      state.entities[course.id] = course;
    },
    syncBookmarkedCourse(state, action: PayloadAction<Course>) {
      if (state.ids.includes(action.payload.id)) {
        state.entities[action.payload.id] = action.payload;
      }
    },
    clearBookmarks(state) {
      state.ids = [];
      state.entities = {};
    },
  },
});

export const { toggleBookmark, syncBookmarkedCourse, clearBookmarks } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
