/**
 * PostgreSQL connection pool for the user service. See TDD Section 5.2.
 */
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 300_000,
  connectionTimeoutMillis: 30_000,
  ssl: process.env.ENVIRONMENT !== 'local' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => logger.error('Idle DB client error', err));

export default pool;
