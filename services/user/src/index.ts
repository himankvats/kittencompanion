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
import { validateJWT } from './middleware/auth';
import { logger } from './utils/logger';
import { CustomError } from './utils/errors';

// TODO: Implement routing (TDD Section 3.2)
// Routes:
//   GET  /users/{user_id}                   → getUserHandler
//   PUT  /users/{user_id}                   → updateUserHandler
//   DELETE /users/{user_id}                 → deleteUserHandler
//   POST /users/{user_id}/confirm-deletion  → confirmDeletionHandler
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 3.2');
};

export default handler;
