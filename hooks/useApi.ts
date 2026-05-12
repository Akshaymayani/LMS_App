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
import { extractErrorMessage, getFallbackPaginatedResponse, safeGet } from '@/utils/safe-property-access';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNetwork } from './useNetwork';

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

/**
 * Wrapper to check network before making API calls
 */
async function withNetworkCheck<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  return fn().catch((error) => {
    console.error(`[API Error] ${errorMessage}:`, error);
    throw error;
  });
}

export function useLoginMutation() {
  const dispatch = useAppDispatch();
  const { isConnected } = useNetwork();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      return authApi.login(payload);
    },
    onSuccess: async (response) => {
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
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      dispatch(
        showSnackbar({
          message: message || 'Login failed. Please try again.',
          tone: 'error',
        })
      );
    },
  });
}

export function useRegisterMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        await persistSession(response.data);
        dispatch(setSession(response.data));
        dispatch(
          showSnackbar({
            message: 'Account created. Let’s start the first sprint.',
            tone: 'success',
          })
        );
      } else {
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
  const { isConnected } = useNetwork();

  return useQuery({
    queryKey: ['instructors', limit],
    queryFn: async () => {
      if (!isConnected) {
        console.warn('[useInstructorsQuery] No network connection');
        return [];
      }

      const response = await catalogApi.getInstructors(1, limit);

      // Safely extract data
      if (!response.success || !response.data?.data) {
        console.warn('[useInstructorsQuery] Invalid response:', response);
        return [];
      }

      return Array.isArray(response.data.data)
        ? response.data.data.map(mapUserToInstructor)
        : [];
    },
    staleTime: FIVE_MINUTES,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useFeaturedCoursesQuery(limit = 6) {
  const { isConnected } = useNetwork();
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const instructorsQuery = useInstructorsQuery(limit * 2);

  const productsQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      if (!isConnected) {
        console.warn('[useFeaturedCoursesQuery] No network connection');
        return [];
      }

      const response = await catalogApi.getProducts(1, limit);

      // Safely extract data with fallback
      if (!response.success || !response.data?.data) {
        console.warn('[useFeaturedCoursesQuery] Invalid response:', response);
        return [];
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    },
    staleTime: FIVE_MINUTES,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
  const { isConnected } = useNetwork();
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const instructorsQuery = useInstructorsQuery(limit * 3);

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'infinite', limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!isConnected) {
        console.warn(`[useInfiniteCoursesQuery] No network connection at page ${pageParam}`);
        return getFallbackPaginatedResponse<Product>();
      }

      const response = await catalogApi.getProducts(pageParam, limit);

      // Safely extract paginated data with fallback
      if (!response.success || !response.data) {
        console.warn(`[useInfiniteCoursesQuery] Invalid response at page ${pageParam}:`, response);
        return getFallbackPaginatedResponse<Product>();
      }

      const paginatedData = safeGet(response, 'data', getFallbackPaginatedResponse<Product>());
      const pageData = safeGet<any[]>(paginatedData, 'data', []);
      console.log(`[useInfiniteCoursesQuery] Page ${pageParam} loaded:`, {
        page: safeGet(paginatedData, 'page'),
        nextPage: safeGet(paginatedData, 'nextPage'),
        totalPages: safeGet(paginatedData, 'totalPages'),
        itemsCount: Array.isArray(pageData) ? pageData.length : 0,
      });
      return paginatedData;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Safely check pagination - the field is 'nextPage' not 'hasNextPage'
      const nextPage = safeGet(lastPage, 'nextPage', false);
      const currentPage = safeGet(lastPage, 'page', 0);

      // nextPage can be boolean or number
      const hasMorePages = typeof nextPage === 'number' ? nextPage > 0 : Boolean(nextPage);

      if (hasMorePages) {
        const nextPageNumber = typeof nextPage === 'number' ? nextPage : currentPage! + 1;
        // console.log(`[useInfiniteCoursesQuery] Will fetch page ${nextPageNumber}`);
        return nextPageNumber;
      }
      return undefined;
    },
    staleTime: FIVE_MINUTES,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const courses = useMemo(() => {
    if (!productsQuery.data?.pages || !Array.isArray(productsQuery.data.pages)) {
      return [];
    }

    const flattenedProducts = productsQuery.data.pages
      .flatMap((page) => safeGet<Product[]>(page, 'data', []))
      .filter(Boolean) ?? [];
    return mapCourses(flattenedProducts, instructorsQuery.data ?? [], progressMap);
  }, [productsQuery.data, instructorsQuery.data, progressMap]);

  return {
    ...productsQuery,
    courses,
    instructorsQuery,
  };
}

export function useCourseDetailQuery(courseId: number) {
  const { isConnected } = useNetwork();
  const progressMap = useAppSelector((state) => state.progress.byCourseId);
  const queryClient = useQueryClient();
  const instructorsQuery = useInstructorsQuery();

  const productQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      // Try to get from cache first
      const cached = getCachedProduct(courseId, queryClient);
      if (cached) {
        return cached;
      }

      // If no network, throw error for offline state
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const response = await catalogApi.getProductById(courseId);

      if (!response) {
        throw new Error('Course not found.');
      }

      return response;
    },
    enabled: Number.isFinite(courseId) && courseId > 0,
    staleTime: FIVE_MINUTES,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const course = useMemo<Course | null>(() => {
    if (!productQuery?.data) {
      return null;
    }

    // Safely map the product to course
    const mappedCourses = mapCourses(
      [productQuery.data],
      instructorsQuery.data ?? [],
      progressMap
    );

    return mappedCourses[0] ?? null;
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
