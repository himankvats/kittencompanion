/**
 * AWS Secrets Manager helper for the auth service. Retrieves secrets by name
 * and caches them in memory for the Lambda instance lifetime.
 * See TDD Section 9.1 for secrets configuration and naming conventions.
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { logger } from '../utils/logger';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(process.env.LOCALSTACK_ENDPOINT ? { endpoint: process.env.LOCALSTACK_ENDPOINT } : {}),
});

// In-memory cache — secrets are stable within a Lambda instance lifetime
const cache: Record<string, string> = {};

export async function getSecret(secretName: string): Promise<string> {
  if (cache[secretName]) {
    return cache[secretName];
  }

  // Local dev: read from env vars (e.g. jwt-secret → JWT_SECRET)
  if (process.env.ENVIRONMENT === 'local') {
    const envKey = secretName.toUpperCase().replace(/-/g, '_');
    const localValue = process.env[envKey];
    if (!localValue) {
      throw new Error(`Missing env var ${envKey} for local secret '${secretName}'`);
    }
    cache[secretName] = localValue;
    return localValue;
  }

  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  let value: string;
  if (response.SecretString) {
    // Secrets Manager stores as JSON object — extract by key or return raw string
    try {
      const parsed = JSON.parse(response.SecretString) as Record<string, string>;
      value = parsed[secretName] ?? response.SecretString;
    } catch {
      value = response.SecretString;
    }
  } else {
    throw new Error(`Secret '${secretName}' has no string value`);
  }

  cache[secretName] = value;
  logger.info('Secret loaded from Secrets Manager', { secretName });
  return value;
}

export default getSecret;
