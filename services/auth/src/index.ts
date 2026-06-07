/**
 * Auth Lambda entry point. Routes incoming API Gateway events to the appropriate
 * handler (signup, verify, refresh, logout) based on HTTP method and path.
 * See TDD Section 3.1 for full handler routing specification.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { signupHandler } from './handlers/signup';
import { loginHandler } from './handlers/login';
import { verifyHandler } from './handlers/verify';
import { refreshHandler } from './handlers/refresh';
import { logoutHandler } from './handlers/logout';
import { CustomError } from './utils/errors';
import { logger } from './utils/logger';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

// TODO: Implement handler routing (TDD Section 3.1)
// Routes:
//   POST /auth/signup  → signupHandler
//   POST /auth/verify  → verifyHandler
//   POST /auth/refresh → refreshHandler
//   POST /auth/logout  → logoutHandler
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;
  const requestId = context.awsRequestId;

  logger.info('Incoming request', { path, method, requestId });

  // Short-circuit CORS preflight requests
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  try {
    const result = await route(event, context);
    return { ...result, headers: { ...CORS_HEADERS, ...result.headers } };
  } catch (error) {
    return handleError(error, requestId);
  }
};

async function route(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const path = event.path;
  const method = event.httpMethod;
  {
    if (path === '/auth/signup' && method === 'POST') {
      return await signupHandler(event, context);
    } else if (path === '/auth/login' && method === 'POST') {
      return await loginHandler(event, context);
    } else if (path === '/auth/verify' && method === 'POST') {
      return await verifyHandler(event, context);
    } else if (path === '/auth/refresh' && method === 'POST') {
      return await refreshHandler(event, context);
    } else if (path === '/auth/logout' && method === 'POST') {
      return await logoutHandler(event, context);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NOT_FOUND', message: 'Route not found' }),
    };
  }
}

function handleError(error: unknown, requestId: string): APIGatewayProxyResult {
  if (error instanceof CustomError) {
    logger.warn('Expected error', { error: error.code, message: error.message, requestId });
    return {
      statusCode: error.statusCode,
      headers: { ...CORS_HEADERS },
      body: JSON.stringify({
        error: error.code,
        message: error.message,
        request_id: requestId,
      }),
    };
  }

  logger.error('Unexpected error', error instanceof Error ? error : new Error(String(error)));
  return {
    statusCode: 500,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      request_id: requestId,
    }),
  };
}
