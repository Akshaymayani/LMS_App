export type ThemePreference = 'system' | 'light' | 'dark';

export interface FreeApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean | number;
  nextPage: boolean | number;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}

export interface AuthUser {
  id?: string | number;
  _id?: string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  coverImage?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface RandomUserName {
  title?: string;
  first: string;
  last: string;
}

export interface RandomUserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface RandomUserLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface RandomUserLogin {
  uuid: string;
  username: string;
}

export interface RandomUser {
  id: number;
  email: string;
  gender?: string;
  name: RandomUserName;
  picture: RandomUserPicture;
  location: RandomUserLocation;
  login: RandomUserLogin;
  nat?: string;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  avatar: string;
  country: string;
  expertise: string;
  username: string;
  bio: string;
}

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  stock: number;
  image: string;
  images: string[];
  instructor: Instructor;
  durationMinutes: number;
  lessonCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  spotlight: string;
  progress: number;
  discountPercentage: number;
}

export interface AvatarUploadPayload {
  avatar?:{
    url: string;
    _id: string;
    localPath: string;
  },
  url?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface SnackbarState {
  visible: boolean;
  message: string;
  tone: 'info' | 'success' | 'error';
  persistent?: boolean;
}

export interface CourseProgress {
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
  lastOpenedAt?: string;
}
