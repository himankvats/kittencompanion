import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { handler } from './index';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';

const app = express();
app.use(cors());
app.use(express.json());

function makeContext(): Context {
  return {
    awsRequestId: `local-${Date.now()}`,
    functionName: 'user-local',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:local:0:function:user-local',
    memoryLimitInMB: '512',
    logGroupName: '/local/user',
    logStreamName: 'local',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    callbackWaitsForEmptyEventLoop: false,
  };
}

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', service: 'user' }));

// /users/:userId and /users/:userId/:action
app.use('/users', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // Parse path segments to build pathParameters
  const segments = req.path.replace(/^\//, '').split('/');
  const userId = segments[0] || null;
  const pathParameters: Record<string, string> = {};
  if (userId) pathParameters['user_id'] = userId;

  const fullPath = '/users' + req.path;
  const event: APIGatewayProxyEvent = {
    path: fullPath,
    httpMethod: req.method,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    queryStringParameters: (req.query as Record<string, string>) || null,
    multiValueQueryStringParameters: null,
    pathParameters,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: fullPath,
    isBase64Encoded: false,
    body: req.body ? JSON.stringify(req.body) : null,
  };
  const result = await handler(event, makeContext());
  const headers = (result.headers ?? {}) as Record<string, string>;
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(result.statusCode).send(result.body);
});

const PORT = Number(process.env.USER_PORT ?? 3002);
app.listen(PORT, () => console.log(`User service → http://localhost:${PORT}`));
