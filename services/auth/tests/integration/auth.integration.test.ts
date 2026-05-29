/**
 * Integration tests for the auth service. Connects to a real test database
 * and exercises the full signup → verify flow end-to-end.
 * See TDD Section 7.2 for integration test specifications.
 * NOTE: Requires docker-compose services to be running (postgres, redis).
 */

import { pool } from '../../src/config/database';

// TODO: Implement integration tests per TDD Section 7.2
// Prerequisite: all migrations applied (001–008)

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // TODO: Run migrations against test database
    // TODO: Seed minimal test fixtures
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    // TODO: Clean up otp_tokens and users rows created by each test
  });

  it.todo('should complete the full signup → verify → JWT flow');

  it.todo('should prevent duplicate OTP creation for same email within 24h');

  it.todo('should mark OTP as used after successful verification');

  it.todo('should reject an expired OTP token');

  it.todo('should reject an already-used OTP token');

  it.todo('should create a user record on first successful verify');
});
