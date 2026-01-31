/**
 * Error handling utilities for API responses
 */

interface FastAPIValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
  url?: string;
}

interface APIErrorResponse {
  detail?: string | FastAPIValidationError[];
  message?: string;
}

/**
 * Extracts a user-friendly error message from API error responses.
 * Handles both string errors and FastAPI validation error arrays.
 * 
 * @param error - The error object from a catch block (typically from axios)
 * @param fallback - Default message if extraction fails
 * @returns A human-readable error message string
 * 
 * @example
 * try {
 *   await api.updateProfile(data);
 * } catch (error) {
 *   toast.error(getErrorMessage(error, 'Failed to update profile'));
 * }
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An error occurred'): string => {
  // Handle axios-style errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: APIErrorResponse; status?: number } };
    const data = axiosError.response?.data;
    
    if (data?.detail) {
      // String detail (common case)
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      
      // FastAPI validation errors (array of objects)
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        const firstError = data.detail[0] as FastAPIValidationError;
        if (firstError?.msg) {
          // Include field location for context if available
          const field = firstError.loc?.length > 1 
            ? String(firstError.loc[firstError.loc.length - 1]) 
            : null;
          return field 
            ? `${field}: ${firstError.msg}` 
            : firstError.msg;
        }
      }
    }
    
    // Alternative message field
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    
    // Status-based fallback messages
    const status = axiosError.response?.status;
    if (status === 401) return 'Please log in to continue';
    if (status === 403) return 'You don\'t have permission to do this';
    if (status === 404) return 'The requested resource was not found';
    if (status === 500) return 'Server error. Please try again later';
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message || fallback;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
};

/**
 * Formats multiple validation errors into a readable list
 * 
 * @param error - The error object from a catch block
 * @returns Array of error messages, or null if not validation errors
 */
export const getValidationErrors = (error: unknown): string[] | null => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: APIErrorResponse } };
    const detail = axiosError.response?.data?.detail;
    
    if (Array.isArray(detail)) {
      return detail.map((err: FastAPIValidationError) => {
        const field = err.loc?.length > 1 
          ? String(err.loc[err.loc.length - 1]) 
          : null;
        return field ? `${field}: ${err.msg}` : err.msg;
      });
    }
  }
  
  return null;
};

export default getErrorMessage;
