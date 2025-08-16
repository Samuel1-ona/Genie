import { toast } from './toast';

/**
 * Error types for different scenarios
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error information structure
 */
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Create a standardized error info object
 */
export function createErrorInfo(
  type: ErrorType,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  code?: string,
  details?: Record<string, any>
): ErrorInfo {
  return {
    type,
    severity,
    message,
    code,
    details,
    timestamp: new Date(),
  };
}

/**
 * Handle errors with appropriate user feedback
 */
export function handleError(error: Error | ErrorInfo, context?: string): void {
  const errorInfo = isErrorInfo(error)
    ? error
    : createErrorInfo(ErrorType.UNKNOWN, error.message, ErrorSeverity.MEDIUM);

  // Log error for debugging
  console.error(`Error${context ? ` in ${context}` : ''}:`, errorInfo);

  // Show appropriate toast based on severity
  switch (errorInfo.severity) {
    case ErrorSeverity.LOW:
      toast.info(errorInfo.message);
      break;
    case ErrorSeverity.MEDIUM:
      toast.warning(errorInfo.message);
      break;
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      toast.error(errorInfo.message);
      break;
  }
}

/**
 * Type guard to check if object is ErrorInfo
 */
export function isErrorInfo(obj: any): obj is ErrorInfo {
  return (
    obj &&
    typeof obj === 'object' &&
    'type' in obj &&
    'severity' in obj &&
    'message' in obj
  );
}

/**
 * Network error handler
 */
export function handleNetworkError(error: Error, context?: string): void {
  const errorInfo = createErrorInfo(
    ErrorType.NETWORK,
    'Network connection error. Please check your internet connection and try again.',
    ErrorSeverity.HIGH,
    'NETWORK_ERROR'
  );

  handleError(errorInfo, context);
}

/**
 * Validation error handler
 */
export function handleValidationError(message: string, context?: string): void {
  const errorInfo = createErrorInfo(
    ErrorType.VALIDATION,
    message,
    ErrorSeverity.MEDIUM,
    'VALIDATION_ERROR'
  );

  handleError(errorInfo, context);
}

/**
 * Authentication error handler
 */
export function handleAuthError(
  message: string = 'Authentication failed. Please log in again.',
  context?: string
): void {
  const errorInfo = createErrorInfo(
    ErrorType.AUTHENTICATION,
    message,
    ErrorSeverity.HIGH,
    'AUTH_ERROR'
  );

  handleError(errorInfo, context);
}

/**
 * Not found error handler
 */
export function handleNotFoundError(resource: string, context?: string): void {
  const errorInfo = createErrorInfo(
    ErrorType.NOT_FOUND,
    `${resource} not found.`,
    ErrorSeverity.MEDIUM,
    'NOT_FOUND'
  );

  handleError(errorInfo, context);
}

/**
 * Server error handler
 */
export function handleServerError(
  message: string = 'Server error occurred. Please try again later.',
  context?: string
): void {
  const errorInfo = createErrorInfo(
    ErrorType.SERVER,
    message,
    ErrorSeverity.HIGH,
    'SERVER_ERROR'
  );

  handleError(errorInfo, context);
}

/**
 * Async error wrapper for functions
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string,
  errorHandler?: (error: Error) => void
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorHandlerFn = errorHandler || handleError;
      errorHandlerFn(error as Error, context);
      return undefined;
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
