import type { CourseProgress } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProgressState {
  byCourseId: Record<number, CourseProgress>;
}

const initialState: ProgressState = {
  byCourseId: {},
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    openCourse(state, action: PayloadAction<{ courseId: number; totalTasks: number }>) {
      const current = state.byCourseId[action.payload.courseId];
      state.byCourseId[action.payload.courseId] = {
        completedTasks: current?.completedTasks ?? 0,
        totalTasks: action.payload.totalTasks,
        completionPercent: current?.completionPercent ?? 0,
        lastOpenedAt: new Date().toISOString(),
      };
    },
    completeTask(
      state,
      action: PayloadAction<{ courseId: number; totalTasks: number; increment?: number }>
    ) {
      const current = state.byCourseId[action.payload.courseId];
      const nextCompleted = Math.min(
        action.payload.totalTasks,
        (current?.completedTasks ?? 0) + (action.payload.increment ?? 1)
      );

      state.byCourseId[action.payload.courseId] = {
        completedTasks: nextCompleted,
        totalTasks: action.payload.totalTasks,
        completionPercent: Math.round((nextCompleted / action.payload.totalTasks) * 100),
        lastOpenedAt: new Date().toISOString(),
      };
    },
    setProgress(
      state,
      action: PayloadAction<{ courseId: number; completedTasks: number; totalTasks: number }>
    ) {
      const { courseId, completedTasks, totalTasks } = action.payload;
      const safeCompleted = Math.min(completedTasks, totalTasks);

      state.byCourseId[courseId] = {
        completedTasks: safeCompleted,
        totalTasks,
        completionPercent: Math.round((safeCompleted / totalTasks) * 100),
        lastOpenedAt: new Date().toISOString(),
      };
    },
  },
});

export const { completeTask, openCourse, setProgress } = progressSlice.actions;
export default progressSlice.reducer;
