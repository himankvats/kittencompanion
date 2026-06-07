/**
 * AWS Secrets Manager helper for the user service. Retrieves secrets by name
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

  // Prefer the injected env var if present (e.g. jwt-secret → JWT_SECRET).
  // The SAM template resolves secrets into env vars at deploy time.
  const envKey = secretName.toUpperCase().replace(/-/g, '_');
  if (process.env[envKey]) {
    cache[secretName] = process.env[envKey] as string;
    return cache[secretName];
  }

  // Local dev with no env var set is a misconfiguration
  if (process.env.ENVIRONMENT === 'local') {
    throw new Error(`Missing env var ${envKey} for local secret '${secretName}'`);
  }

  // Fallback: read directly from Secrets Manager using the full path
  const fullName = secretName.includes('/')
    ? secretName
    : `kitten-companion/${process.env.ENVIRONMENT ?? 'dev'}/${secretName}`;
  const command = new GetSecretValueCommand({ SecretId: fullName });
  const response = await client.send(command);

  let value: string;
  if (response.SecretString) {
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
