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

type UploadableAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export const authApi = {
  async login(payload: LoginRequest) {
    try {
      const response = await axiosInstance.post<FreeApiResponse<AuthPayload>>('/users/login', payload);
      return response.data;
    } catch (error) {
      console.log("INSIDE ERROR BLCOK CATCH ", error);

      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
    }
  },

  async register(payload: RegisterRequest) {
    try {
      const response = await axiosInstance.post<FreeApiResponse<AuthPayload>>(
        '/users/register',
        payload
      );
      console.log("MAIN REGISTER RESPONSE ", response.data);
      
      return response.data;
    } catch (error) {
      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
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
      return response.data;
    } catch (error) {
      console.log("ERROR in IMAGE UPLOAD", error);
      
      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
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
      return response.data;
    } catch (error) {
      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
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
      return response.data;
    } catch (error) {
      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
    }
  },

  async getProductById(courseId: number) {
    try {
      const response = await this.getProducts(1, 100);
      return response.data?.data?.find((product) => product.id === courseId) ?? null;
    } catch (error) {
      return error instanceof Error
        ? { statusCode: 500, data: null, message: error.message, success: false }
        : { statusCode: 500, data: null, message: 'An unknown error occurred.', success: false };
    }
  },
};
