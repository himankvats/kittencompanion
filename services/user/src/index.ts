/**
 * User Lambda entry point. Routes incoming API Gateway events to the appropriate
 * handler (getUser, updateUser, deleteUser, confirmDeletion) based on path and method.
 * See TDD Section 3.2 for handler routing and API contracts (Section 2.2).
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getUserHandler } from './handlers/getUser';
import { updateUserHandler } from './handlers/updateUser';
import { deleteUserHandler } from './handlers/deleteUser';
import { confirmDeletionHandler } from './handlers/confirmDeletion';
import { logger } from './utils/logger';
import { CustomError } from './utils/errors';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

// Routes:
//   GET    /users/{user_id}                   → getUserHandler
//   PUT    /users/{user_id}                   → updateUserHandler
//   DELETE /users/{user_id}                   → deleteUserHandler
//   POST   /users/{user_id}/confirm-deletion  → confirmDeletionHandler
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const requestId = context.awsRequestId;

  logger.info('Incoming request', { path: event.path, method, requestId });

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

  if (method === 'POST' && path.endsWith('/confirm-deletion')) {
    return await confirmDeletionHandler(event, context);
  }

  if (/^\/users\/[^/]+$/.test(path)) {
    if (method === 'GET') return await getUserHandler(event, context);
    if (method === 'PUT') return await updateUserHandler(event, context);
    if (method === 'DELETE') return await deleteUserHandler(event, context);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'NOT_FOUND', message: 'Route not found' }),
  };
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

export default handler;
