import { authApi, catalogApi } from '@/services/api';
import { persistSession } from '@/services/auth-storage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession, signOut, updateProfile } from '@/store/slices/authSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import type {
  AuthPayload,
  Course,
  Instructor,
  LoginRequest,
  PaginatedResponse,
  Product,
  RegisterRequest,
} from '@/types';
import { mapProductToCourse, mapUserToInstructor } from '@/utils/course-mapper';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

const FIVE_MINUTES = 1000 * 60 * 5;
const FALLBACK_INSTRUCTOR: Instructor = {
  id: 0,
  name: 'MyEducation Studio',
  email: 'studio@myeducation.app',
  avatar: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80',
  country: 'Remote',
  expertise: 'Learning Experience Design',
  username: 'studio',
  bio: 'A blended teaching squad focused on clear systems, polished delivery, and practical outcomes.',
};

function mapCourses(
  products: Product[],
  instructors: Instructor[],
  progressMap: Record<number, { completionPercent: number }>
) {
  return products.map((product, index) =>
    mapProductToCourse(
      product,
      instructors.length ? instructors[(product.id + index) % instructors.length] : FALLBACK_INSTRUCTOR,
      progressMap[product.id]?.completionPercent ?? 0
    )
  );
}

function getCachedProduct(
  courseId: number,
  cache: ReturnType<typeof useQueryClient>
): Product | null {
  const featured = cache.getQueryData<Product[]>(['products', 'featured']);

  if (featured) {
    const match = featured.find((item) => item.id === courseId);
    if (match) {
      return match;
    }
  }

  const infiniteEntries = cache.getQueriesData<InfiniteData<PaginatedResponse<Product>>>({
    queryKey: ['products', 'infinite'],
  });

  for (const [, entry] of infiniteEntries) {
    const match = entry?.pages.flatMap((page) => page.data).find((item) => item.id === courseId);
    if (match) {
      return match;
    }
  }

  return null;
}

export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: async (response) => {
      console.log("LOGIN RESPONSE ", response.data);

      if (response.success && response.data) {
        await persistSession(response.data);
        dispatch(setSession(response.data));
        dispatch(
          showSnackbar({
            message: 'Welcome back. Your learning space is ready.',
            tone: 'success',
          })
        );
      } else {
        dispatch(
          showSnackbar({
            message: response.message || 'Login failed. Please try again.',
            tone: 'error',
          })
        );
      }
    }
  });
}

export function useRegisterMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: async (response) => {
      console.log("REGISTER RESPONSE ", response);
      
      if (response.success && response.data) {
      await persistSession(response.data);
      dispatch(setSession(response.data));
      dispatch(
        showSnackbar({
          message: 'Account created. Let’s start the first sprint.',
          tone: 'success',
        })
      );
    }else {
      dispatch(
        showSnackbar({
          message: response.message || 'Registration failed. Please try again.',
          tone: 'error',
        })
      );
    }
    },
  });
}

export function useLogoutAction() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return async () => {
    await dispatch(signOut()).unwrap();
    queryClient.clear();
  };
}

export function useUploadAvatarMutation() {
  return useMutation({
    mutationFn: authApi.uploadAvatar,
  });
}

export function useInstructorsQuery(limit = 18) {
  return useQuery({
    queryKey: ['instructors', limit],
    queryFn: async () => {

      const response = await catalogApi.getInstructors(1, limit);
      return response?.data?.data.map(mapUserToInstructor);
    },
    staleTime: FIVE_MINUTES,
  });
}

export function useFeaturedCoursesQuery(limit = 6) {
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const instructorsQuery = useInstructorsQuery(limit * 2);

  const productsQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await catalogApi.getProducts(1, limit);
      return response?.data?.data;
    },
    staleTime: FIVE_MINUTES,
  });

  const courses = useMemo(
    () => mapCourses(productsQuery.data ?? [], instructorsQuery.data ?? [], progressMap),
    [productsQuery.data, instructorsQuery.data, progressMap]
  );

  return {
    ...productsQuery,
    courses,
    instructorsQuery,
  };
}

export function useInfiniteCoursesQuery(limit = 10) {
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const instructorsQuery = useInstructorsQuery(limit * 3);

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'infinite', limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await catalogApi.getProducts(pageParam, limit);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage?.nextPage ? lastPage.page + 1 : undefined),
    staleTime: FIVE_MINUTES,
  });

  const courses = useMemo(() => {
    const flattenedProducts = productsQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return mapCourses(flattenedProducts, instructorsQuery.data ?? [], progressMap);
  }, [productsQuery.data, instructorsQuery.data, progressMap]);

  return {
    ...productsQuery,
    courses,
    instructorsQuery,
  };
}

export function useCourseDetailQuery(courseId: number) {
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const queryClient = useQueryClient();
  const instructorsQuery = useInstructorsQuery();

  const productQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const cached = getCachedProduct(courseId, queryClient);

      if (cached) {
        return cached;
      }

      const response = await catalogApi.getProductById(courseId);

      if (!response) {
        throw new Error('Course not found.');
      }

      return response;
    },
    enabled: Number.isFinite(courseId) && courseId > 0,
    staleTime: FIVE_MINUTES,
  });

  const course = useMemo<Course | null>(() => {
    if (!productQuery?.data) {
      return null;
    }
    return (
      mapCourses([productQuery?.data], instructorsQuery.data ?? [], progressMap)[0] ?? null
    );
  }, [instructorsQuery.data, productQuery.data, progressMap]);

  return {
    ...productQuery,
    course,
    instructorsQuery,
  };
}

export async function syncProfileToStore(
  dispatch: ReturnType<typeof useAppDispatch>,
  payload: AuthPayload
) {
  await persistSession(payload);
  dispatch(updateProfile(payload.user));
}
