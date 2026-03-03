/**
 * Centralized error handling utility for the application.
 * Provides consistent error messages and logging.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Wraps an error with user-friendly message and error code
 */
export function handleApiError(error: any): AppError {
  console.error('API Error:', error);

  // Network errors (no response)
  if (!error.response) {
    return new AppError(
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      ErrorCode.NETWORK_ERROR,
      undefined,
      error
    );
  }

  const status = error.response?.status;
  const message = error.response?.data?.detail || error.message;

  // Authentication errors
  if (status === 401) {
    return new AppError(
      'Sesión expirada. Por favor, inicia sesión nuevamente.',
      ErrorCode.AUTH_ERROR,
      401,
      error
    );
  }

  // Forbidden
  if (status === 403) {
    return new AppError(
      'No tienes permisos para realizar esta acción.',
      ErrorCode.AUTH_ERROR,
      403,
      error
    );
  }

  // Not found
  if (status === 404) {
    return new AppError(
      'Recurso no encontrado.',
      ErrorCode.NOT_FOUND,
      404,
      error
    );
  }

  // Validation errors
  if (status === 422) {
    return new AppError(
      message || 'Los datos proporcionados no son válidos.',
      ErrorCode.VALIDATION_ERROR,
      422,
      error
    );
  }

  // Server errors
  if (status >= 500) {
    return new AppError(
      'Error del servidor. Intenta de nuevo más tarde.',
      ErrorCode.SERVER_ERROR,
      status,
      error
    );
  }

  // Default error
  return new AppError(
    message || 'Ocurrió un error inesperado.',
    ErrorCode.UNKNOWN_ERROR,
    status,
    error
  );
}

/**
 * Safely ensures a value is an array, returns empty array if null/undefined
 */
export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
