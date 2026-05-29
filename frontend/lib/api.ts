/**
 * Typed API client for the Kitten Companion frontend. All fetch calls to the
 * API Gateway are centralised here. The base URL is read from the NEXT_PUBLIC_API_URL
 * environment variable. See TDD Section 2 for full API contract.
 */

import { getToken } from './auth';
import type {
  User,
  Pet,
  CheckIn,
  AcuteEvent,
  SummaryGeneration,
  APIResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4566';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  authenticated = true
): Promise<T> {
  // TODO: Implement request helper (TDD Section 2)
  // - Attach Authorization: Bearer {token} if authenticated
  // - Parse JSON response
  // - On 4xx/5xx: throw with error code from response body
  throw new Error(`Not implemented - see TDD Section 2 (${method} ${path})`);
}

// ------------------------------------------------------------------
// Auth APIs — TDD Section 2.1
// ------------------------------------------------------------------

// TODO: Implement signup (TDD Section 2.1.1)
export async function signup(
  email: string,
  firstName: string,
  lastName: string
): Promise<{ message: string; email: string; expires_in_seconds: number }> {
  return request('POST', '/auth/signup', { email, first_name: firstName, last_name: lastName }, false);
}

// TODO: Implement verifyOTP (TDD Section 2.1.2)
export async function verifyOTP(
  otpToken: string
): Promise<{ jwt_token: string; user: User; expires_in: number }> {
  return request('POST', '/auth/verify', { otp_token: otpToken }, false);
}

// TODO: Implement refreshToken (TDD Section 2.1.3)
export async function refreshToken(jwtToken: string): Promise<{ jwt_token: string; expires_in: number }> {
  return request('POST', '/auth/refresh', { jwt_token: jwtToken }, false);
}

// TODO: Implement logout (TDD Section 2.1.4)
export async function logout(jwtToken: string): Promise<{ message: string }> {
  return request('POST', '/auth/logout', { jwt_token: jwtToken });
}

// ------------------------------------------------------------------
// User APIs — TDD Section 2.2
// ------------------------------------------------------------------

// TODO: Implement getUser (TDD Section 2.2.1)
export async function getUser(userId: string): Promise<User> {
  return request('GET', `/users/${userId}`);
}

// TODO: Implement updateUser (TDD Section 2.2.2)
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  return request('PUT', `/users/${userId}`, updates);
}

// ------------------------------------------------------------------
// Pet APIs — TDD Section 2.3
// ------------------------------------------------------------------

// TODO: Implement createPet (TDD Section 2.3.1)
export async function createPet(petData: Partial<Pet>): Promise<Pet> {
  return request('POST', '/pets', petData);
}

// TODO: Implement getPet (TDD Section 2.3.2)
export async function getPet(petId: string): Promise<Pet> {
  return request('GET', `/pets/${petId}`);
}

// TODO: Implement listPets (TDD Section 2.3.4)
export async function listPets(userId: string): Promise<{ pets: Pet[]; count: number }> {
  return request('GET', `/users/${userId}/pets`);
}

// ------------------------------------------------------------------
// Check-in APIs — TDD Section 2.4
// ------------------------------------------------------------------

// TODO: Implement createCheckin (TDD Section 2.4.1)
export async function createCheckin(payload: Partial<CheckIn>): Promise<CheckIn & { feedback_text: string }> {
  return request('POST', '/checkins', payload);
}

// TODO: Implement getCheckinHistory (TDD Section 2.4.2)
export async function getCheckinHistory(
  petId: string,
  params?: { limit?: number; offset?: number }
): Promise<{ checkins: CheckIn[]; total: number }> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request('GET', `/pets/${petId}/checkins${qs ? '?' + qs : ''}`);
}

// ------------------------------------------------------------------
// Triage APIs — TDD Section 2.5
// ------------------------------------------------------------------

// TODO: Implement flagConcern (TDD Section 2.5.1)
export async function flagConcern(payload: {
  pet_id: string;
  concern_type: string;
  followup_answers: Record<string, unknown>;
}): Promise<AcuteEvent> {
  return request('POST', '/concerns', payload);
}

// ------------------------------------------------------------------
// Summary APIs — TDD Section 2.6
// ------------------------------------------------------------------

// TODO: Implement generateSummary (TDD Section 2.6.1)
export async function generateSummary(
  petId: string,
  params?: { format?: 'html' | 'text'; include_acute_events?: boolean }
): Promise<{ html_report: string; text_report: string; generated_at: string }> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request('GET', `/pets/${petId}/summaries${qs ? '?' + qs : ''}`);
}

// Export as named object for convenience
export const apiClient = {
  signup,
  verifyOTP,
  refreshToken,
  logout,
  getUser,
  updateUser,
  createPet,
  getPet,
  listPets,
  createCheckin,
  getCheckinHistory,
  flagConcern,
  generateSummary,
};
