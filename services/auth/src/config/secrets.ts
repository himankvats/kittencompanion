/**
 * AWS Secrets Manager helper for the auth service. Retrieves secrets by name
 * and caches them in memory for the Lambda instance lifetime.
 * See TDD Section 9.1 for secrets configuration and naming conventions.
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { logger } from '../utils/logger';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  // TODO: For local development point to LocalStack endpoint (TDD Section 8.2)
  // endpoint: process.env.LOCALSTACK_ENDPOINT,
});

// In-memory cache — secrets are stable within a Lambda instance lifetime
const cache: Record<string, string> = {};

// TODO: Implement getSecret (TDD Section 9.1)
// 1. Check in-memory cache first
// 2. Call SecretsManager.GetSecretValue
// 3. Cache and return the secret string
// 4. Fall back to environment variable of the same name in local dev
export async function getSecret(secretName: string): Promise<string> {
  if (cache[secretName]) {
    return cache[secretName];
  }

  // Local dev shortcut — fall back to env vars (TDD Section 8.2)
  if (process.env.ENVIRONMENT === 'local' && process.env[secretName.toUpperCase().replace(/-/g, '_')]) {
    const localValue = process.env[secretName.toUpperCase().replace(/-/g, '_')] as string;
    cache[secretName] = localValue;
    return localValue;
  }

  throw new Error('Not implemented - see TDD Section 9.1 (AWS Secrets Manager integration)');
}

export default getSecret;
