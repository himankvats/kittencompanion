import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { handler } from './index';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';

const app = express();
app.use(cors());
app.use(express.json());

const fakeContext: Context = {
  awsRequestId: `local-${Date.now()}`,
  functionName: 'auth-local',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:local:0:function:auth-local',
  memoryLimitInMB: '512',
  logGroupName: '/local/auth',
  logStreamName: 'local',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
  callbackWaitsForEmptyEventLoop: false,
};

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', service: 'auth' }));

// Catch-all for /auth/** — use middleware pattern (works in Express 4 and 5)
app.use('/auth', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const event: APIGatewayProxyEvent = {
    path: '/auth' + req.path,
    httpMethod: req.method,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    queryStringParameters: req.query as Record<string, string> | null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: req.path,
    isBase64Encoded: false,
    body: req.body ? JSON.stringify(req.body) : null,
  };
  const result = await handler(event, fakeContext);
  const headers = (result.headers ?? {}) as Record<string, string>;
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(result.statusCode).send(result.body);
});

const PORT = Number(process.env.AUTH_PORT ?? 3001);
app.listen(PORT, () => console.log(`Auth service → http://localhost:${PORT}`));
