import { axiosInstance } from '@/services/axios-instance';
import type {
    AuthPayload,
    AvatarUploadPayload,
    FreeApiResponse,
    LoginRequest,
    PaginatedResponse,
    Product,
    RandomUser,
    RegisterRequest,
} from '@/types';
import {
    extractErrorMessage,
    getFallbackPaginatedResponse,
    safeGet
} from '@/utils/safe-property-access';

type UploadableAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

/**
 * Generic error handler for API calls
 */
function handleApiError(error: any, operation: string = 'Operation') {
  console.error(`[${operation}] API Error:`, error);

  return {
    statusCode: safeGet(error, 'statusCode', 500),
    data: null,
    message: extractErrorMessage(error),
    success: false,
  };
}

export const authApi = {
  async login(payload: LoginRequest) {
    try {
      const response = await axiosInstance.post<FreeApiResponse<AuthPayload>>(
        '/users/login',
        payload
      );
      
      // Ensure we have a valid response structure
      if (!response.data || !response.data.success) {
        return {
          statusCode: response.data?.statusCode || 401,
          data: null,
          message: response.data?.message || 'Login failed',
          success: false,
        };
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, 'Login');
    }
  },

  async register(payload: RegisterRequest) {
    try {
      const response = await axiosInstance.post<FreeApiResponse<AuthPayload>>(
        '/users/register',
        payload
      );

      // Ensure we have a valid response structure
      if (!response.data || !response.data.success) {
        return {
          statusCode: response.data?.statusCode || 400,
          data: null,
          message: response.data?.message || 'Registration failed',
          success: false,
        };
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, 'Register');
    }
  },

  async uploadAvatar(asset: UploadableAsset) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as never);

      const response = await axiosInstance.patch<FreeApiResponse<AvatarUploadPayload>>(
        '/users/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data || !response.data.success) {
        return {
          statusCode: response.data?.statusCode || 400,
          data: null,
          message: response.data?.message || 'Avatar upload failed',
          success: false,
        };
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, 'Avatar Upload');
    }
  },
};

export const catalogApi = {
  async getProducts(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get<FreeApiResponse<PaginatedResponse<Product>>>(
        '/public/randomproducts',
        {
          params: {
            page,
            limit,
          },
        }
      );

      // Validate response structure
      if (!response.data) {
        throw new Error('Empty response from server');
      }

      if (!response.data.success) {
        return {
          statusCode: response.data.statusCode || 400,
          data: getFallbackPaginatedResponse<Product>(),
          message: response.data.message || 'Failed to fetch products',
          success: false,
        };
      }

      // Safely extract data with fallback
      const data = safeGet<PaginatedResponse<Product>>(
        response.data,
        'data',
        getFallbackPaginatedResponse<Product>()
      );

      return {
        ...response.data,
        data: data,
      };
    } catch (error) {
      console.error('[getProducts] Error:', error);
      return {
        statusCode: safeGet(error, 'statusCode', 500),
        data: getFallbackPaginatedResponse<Product>(),
        message: extractErrorMessage(error),
        success: false,
      };
    }
  },

  async getInstructors(page = 1, limit = 18) {
    try {
      const response = await axiosInstance.get<FreeApiResponse<PaginatedResponse<RandomUser>>>(
        '/public/randomusers',
        {
          params: {
            page,
            limit,
          },
        }
      );

      // Validate response structure
      if (!response.data) {
        throw new Error('Empty response from server');
      }

      if (!response.data.success) {
        return {
          statusCode: response.data.statusCode || 400,
          data: getFallbackPaginatedResponse<RandomUser>(),
          message: response.data.message || 'Failed to fetch instructors',
          success: false,
        };
      }

      // Safely extract data with fallback
      const data = safeGet<PaginatedResponse<RandomUser>>(
        response.data,
        'data',
        getFallbackPaginatedResponse<RandomUser>()
      );

      return {
        ...response.data,
        data: data,
      };
    } catch (error) {
      console.error('[getInstructors] Error:', error);
      return {
        statusCode: safeGet(error, 'statusCode', 500),
        data: getFallbackPaginatedResponse<RandomUser>(),
        message: extractErrorMessage(error),
        success: false,
      };
    }
  },

  async getProductById(courseId: number) {
    try {
      const response = await this.getProducts(1, 100);

      // Check if response is valid and has data
      if (!response.success || !response.data?.data) {
        return null;
      }

      // Safely find the product
      const product = response?.data?.data?.find((product) => product.id === courseId);
      return product ?? null;
    } catch (error) {
      console.error('[getProductById] Error:', error);
      return null;
    }
  },
};
