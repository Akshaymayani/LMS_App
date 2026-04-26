/**
 * Safely access nested properties without throwing errors
 * @param obj - The object to access
 * @param path - The path to the property (e.g., 'data.items[0].name')
 * @param defaultValue - The default value if path doesn't exist
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue: T | undefined = undefined
): T | undefined {
  try {
    const value = path.split('.').reduce((current, prop) => {
      if (!current) return undefined;
      return current[prop];
    }, obj);
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    console.warn(`Safe access error for path "${path}":`, error);
    return defaultValue;
  }
}

/**
 * Check if a response is valid and has the expected structure
 */
export function isValidResponse<T extends Record<string, any>>(
  response: any,
  requiredFields: (keyof T)[] = []
): response is T {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every((field) => field in response);
}

/**
 * Safely extract data from API response with fallback
 */
export function extractResponseData<T = any>(
  response: any,
  dataPath: string = 'data.data',
  defaultValue: T[] = []
): T[] {
  try {
    const data = safeGet<T[]>(response, dataPath);
    return Array.isArray(data) ? data : defaultValue;
  } catch (error) {
    console.warn(`Error extracting response data:`, error);
    return defaultValue;
  }
}

/**
 * Handle API error with safe message extraction
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.statusText) {
    return error.response.statusText;
  }

  return 'An error occurred. Please try again.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const networkErrors = [
    'Network Error',
    'ECONNABORTED',
    'ENOTFOUND',
    'ERR_NETWORK',
    'ERR_TLS_CERT_ALTNAME',
    'timeout of',
  ];

  const message = extractErrorMessage(error);
  const errorCode = error?.code || error?.response?.status;

  return (
    networkErrors.some((err) => message.includes(err)) ||
    errorCode === 0 ||
    !error.response
  );
}

/**
 * Provide fallback data structure
 */
export function getFallbackPaginatedResponse<T = any>(data: T[] = []) {
  return {
    data: data,
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  };
}
