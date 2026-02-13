import { NextResponse } from 'next/server';

// Standard error codes
export const ErrorCodes = {
  INVALID_ID: 'invalid_id',
  NOT_FOUND: 'not_found',
  INTERNAL_ERROR: 'internal_error',
  BAD_REQUEST: 'bad_request',
  UNAUTHORIZED: 'unauthorized',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Standard error response shape
export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
  };
}

// Custom error class for typed errors
export class ApiErrorResponse extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiErrorResponse';
  }
}

// Helper to create error responses
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status: statusCode }
  );
}

// Helper to handle unknown errors
export function handleUnknownError(error: unknown): NextResponse<ApiError> {
  console.error('Unhandled error:', error);
  
  if (error instanceof ApiErrorResponse) {
    return createErrorResponse(error.code, error.message, error.statusCode);
  }
  
  return createErrorResponse(
    ErrorCodes.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  );
}
