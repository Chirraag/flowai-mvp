/**
 * Shared error handling utilities for AI Agents
 * Consistent error handling patterns across all agent pages
 */

export interface ErrorContext {
  action: string;
  fallbackMessage?: string;
  tabName?: string;
}

/**
 * Enhanced error handling for API operations
 * Provides consistent error messages and user feedback
 */
export const handleApiError = (error: any, context: ErrorContext): { title: string; description: string; variant: 'default' | 'destructive' } => {
  // Extract error message from various error formats
  let errorMessage = context.fallbackMessage || 'An unexpected error occurred';

  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Add context if provided
  const title = context.tabName ? `Error in ${context.tabName}` : 'Error';

  return {
    title,
    description: errorMessage,
    variant: 'destructive' as const
  };
};

/**
 * Retry utility with exponential backoff
 * Used for both data fetching and save operations
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> => {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Create error boundary for async operations
 * Wraps operations with try/catch and consistent error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  onError?: (error: any) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      // Default error handling - could integrate with toast system
    }
    return null;
  }
};

/**
 * Validate required context before operations
 */
export const validateOperationContext = (context: { orgId?: string; user?: any }): { valid: boolean; error?: string } => {
  if (!context.orgId && !context.user?.org_id && !context.user?.workspaceId) {
    return {
      valid: false,
      error: 'User organization not found. Please refresh the page and try again.'
    };
  }

  return { valid: true };
};
