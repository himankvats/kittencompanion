/**
 * Custom error classes for the auth service. All thrown errors should be instances
 * of CustomError so the Lambda handler can map them to correct HTTP status codes.
 * See TDD Section 6.1 for error handling strategy.
 */

export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    // Maintain proper stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export default CustomError;
