/**
 * Custom error class for the user service. Maps domain errors to HTTP status codes.
 * See TDD Section 6.1 for error handling strategy and TDD Section 2.7 for error formats.
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
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export default CustomError;
