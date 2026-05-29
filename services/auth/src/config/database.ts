/**
 * PostgreSQL connection pool configuration for the auth service.
 * Uses node-postgres (pg) with HikariCP-equivalent settings.
 * See TDD Section 5.2 for pool configuration specification.
 */

import { Pool } from 'pg';
import { logger } from '../utils/logger';

// TODO: Implement database pool (TDD Section 5.2)
// Pool settings per TDD:
//   max: 20
//   idleTimeoutMillis: 300000 (5 minutes)
//   connectionTimeoutMillis: 30000
//   ssl: { rejectUnauthorized: false } (required for AWS RDS)
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 300_000,
  connectionTimeoutMillis: 30_000,
  // TODO: enable SSL for non-local environments (TDD Section 5.2)
  // ssl: process.env.ENVIRONMENT !== 'local' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle DB client', err);
});

export default pool;
