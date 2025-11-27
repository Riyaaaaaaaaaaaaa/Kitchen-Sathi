// TypeScript interfaces for backend error responses

// Backend validation error response format
export interface BackendValidationError {
  details: {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
  };
}

// Frontend error processing result
export interface ProcessedError {
  message: string;
  fieldErrors: Record<string, string[]>;
  isValidationError: boolean;
}

// API error response (what the backend returns)
export interface ApiErrorResponse {
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
    error?: string | string[] | object;
    message?: string;
  };
  message?: string;
  error?: string | string[] | object;
}

// Example backend response for validation errors
export const exampleBackendResponse: BackendValidationError = {
  details: {
    formErrors: ["Please check the form"],
    fieldErrors: {
      expiryDate: ["Invalid datetime format"],
      daysBeforeExpiry: ["Must be numbers between 0 and 30"]
    }
  }
};

// Example frontend processing result
export const exampleProcessedResult: ProcessedError = {
  message: "Please check the form.",
  fieldErrors: {
    expiryDate: ["Invalid datetime format"],
    daysBeforeExpiry: ["Must be numbers between 0 and 30"]
  },
  isValidationError: true
};

// Type guard functions
export function isBackendValidationError(error: any): error is BackendValidationError {
  return error && 
         error.details && 
         typeof error.details === 'object' &&
         (Array.isArray(error.details.formErrors) || 
          (error.details.fieldErrors && typeof error.details.fieldErrors === 'object'));
}

export function hasFormErrors(error: any): boolean {
  return isBackendValidationError(error) && 
         error.details.formErrors && 
         error.details.formErrors.length > 0;
}

export function hasFieldErrors(error: any): boolean {
  return isBackendValidationError(error) && 
         error.details.fieldErrors && 
         Object.keys(error.details.fieldErrors).length > 0;
}

// Utility function to extract field errors for specific field
export function getFieldErrors(error: any, fieldName: string): string[] {
  if (isBackendValidationError(error)) {
    return error.details.fieldErrors?.[fieldName] || [];
  }
  return [];
}

// Utility function to check if a specific field has errors
export function hasFieldError(error: any, fieldName: string): boolean {
  return getFieldErrors(error, fieldName).length > 0;
}
