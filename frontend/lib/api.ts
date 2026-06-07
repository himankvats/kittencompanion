import { getToken } from './auth';
import type { User, Pet, CheckIn, AcuteEvent } from './types';

// In dev: empty string — all /api/* calls go through Next.js rewrites to backend services.
// In prod: set NEXT_PUBLIC_API_URL to the API Gateway base URL (no trailing slash).
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (authenticated) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) throw new ApiError('NETWORK_ERROR', res.statusText, res.status);
    return undefined as unknown as T;
  }

  if (!res.ok) {
    const err = json as { error?: string; message?: string };
    throw new ApiError(err.error ?? 'UNKNOWN_ERROR', err.message ?? res.statusText, res.status);
  }

  return json as T;
}

// ------------------------------------------------------------------
// Auth APIs  →  /api/auth/*  →  rewrite  →  :3001/auth/*
// ------------------------------------------------------------------

export function signup(email: string, firstName: string, lastName: string) {
  return request<{ message: string; email: string; expires_in_seconds: number }>(
    'POST', '/api/auth/signup', { email, first_name: firstName, last_name: lastName }, false
  );
}

export function login(email: string) {
  return request<{ message: string; email: string; expires_in_seconds: number }>(
    'POST', '/api/auth/login', { email }, false
  );
}

export function verifyOTP(otpToken: string) {
  return request<{ jwt_token: string; user: User; expires_in: number }>(
    'POST', '/api/auth/verify', { otp_token: otpToken }, false
  );
}

export function refreshToken(jwtToken: string) {
  return request<{ jwt_token: string; expires_in: number }>(
    'POST', '/api/auth/refresh', { jwt_token: jwtToken }, false
  );
}

export function logout(jwtToken: string) {
  return request<{ message: string }>('POST', '/api/auth/logout', { jwt_token: jwtToken });
}

// ------------------------------------------------------------------
// User APIs  →  /api/users/*  →  rewrite  →  :3002/users/*
// ------------------------------------------------------------------

export function getUser(userId: string) {
  return request<User>('GET', `/api/users/${userId}`);
}

export function updateUser(userId: string, updates: Partial<User>) {
  return request<User>('PUT', `/api/users/${userId}`, updates);
}

// ------------------------------------------------------------------
// Pet APIs  →  /api/pets/*  →  rewrite  →  :8080/pets/*
// ------------------------------------------------------------------

function orNull(v: string | undefined): string | null {
  return v && v.trim() !== '' ? v : null;
}

function toPetRequest(p: Partial<Pet>): Record<string, unknown> {
  return {
    name: p.name,
    ageMonths: p.age_months,
    gender: orNull(p.gender),
    neuteredSpayed: orNull(p.neutered_spayed),
    breed: orNull(p.breed),
    adoptionDate: orNull(p.adoption_date),
    source: orNull(p.source),
    siblingBonded: orNull(p.sibling_bonded),
    currentConcerns: orNull(p.current_concerns),
  };
}

export function createPet(petData: Partial<Pet>) {
  return request<Pet>('POST', '/api/pets', toPetRequest(petData));
}

export function getPet(petId: string) {
  return request<Pet>('GET', `/api/pets/${petId}`);
}

export function updatePet(petId: string, updates: Partial<Pet>) {
  return request<Pet>('PUT', `/api/pets/${petId}`, toPetRequest(updates));
}

export function listPets(userId: string) {
  return request<{ pets: Pet[]; count: number }>('GET', `/api/users/${userId}/pets`);
}

// ------------------------------------------------------------------
// Check-in APIs  →  /api/checkins  →  :8081/checkins
//                   /api/pets/:id/checkins  →  :8081/pets/:id/checkins
// ------------------------------------------------------------------

export function createCheckin(payload: Partial<CheckIn>) {
  return request<CheckIn & { feedback_text: string }>('POST', '/api/checkins', payload);
}

export function getCheckinHistory(petId: string, params?: { limit?: number; offset?: number }) {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return request<{ checkins: CheckIn[]; total: number }>(
    'GET', `/api/pets/${petId}/checkins${qs ? '?' + qs : ''}`
  );
}

// ------------------------------------------------------------------
// Triage APIs  →  /api/concerns  →  :8082/concerns
// ------------------------------------------------------------------

export function listConcerns(petId: string) {
  return request<{ concerns: AcuteEvent[]; total: number }>(
    'GET', `/api/pets/${petId}/concerns`
  );
}

export function flagConcern(payload: {
  pet_id: string;
  concern_type: string;
  followup_answers: Record<string, unknown>;
}) {
  return request<AcuteEvent>('POST', '/api/concerns', payload);
}

export function resolveConcern(concernId: string, payload: { resolution: string; notes?: string }) {
  return request<{ id: string; concern_type: string; resolution: string; resolved_at: string }>(
    'POST', `/api/concerns/${concernId}/resolve`, payload
  );
}

// ------------------------------------------------------------------
// Summary APIs  →  /api/pets/:id/summaries  →  :8083/pets/:id/summaries
// ------------------------------------------------------------------

export function generateSummary(
  petId: string,
  params?: { format?: 'html' | 'text'; include_acute_events?: boolean }
) {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return request<{ html_report: string; text_report: string; generated_at: string }>(
    'GET', `/api/pets/${petId}/summaries${qs ? '?' + qs : ''}`
  );
}

export const apiClient = {
  signup, login, verifyOTP, refreshToken, logout,
  getUser, updateUser,
  createPet, getPet, updatePet, listPets,
  createCheckin, getCheckinHistory,
  listConcerns, flagConcern, resolveConcern,
  generateSummary,
};
