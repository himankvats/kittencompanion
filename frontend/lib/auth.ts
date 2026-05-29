/**
 * JWT storage and authentication state management for the frontend.
 * Stores the token in an httpOnly cookie via Next.js API route (preferred)
 * or localStorage for development. See TDD Section 2.1.2 for JWT specification.
 */

// TODO: Implement getToken (TDD Section 2.1.2)
// Reads JWT from httpOnly cookie (production) or localStorage (dev fallback)
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // TODO: Switch to cookie-based storage for production security (TDD Section 2.1.2)
  return window.localStorage.getItem('kittencompanion_token');
}

// TODO: Implement setToken (TDD Section 2.1.2)
// Stores JWT — in production should set an httpOnly Secure cookie via server action
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('kittencompanion_token', token);
}

// TODO: Implement clearToken (TDD Section 2.1.4)
// Removes JWT on logout
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('kittencompanion_token');
}

// TODO: Implement isAuthenticated (TDD Section 2.1.2)
// Returns true if a non-expired token exists
// NOTE: for real expiry checking, decode the JWT payload and compare exp with Date.now()
export function isAuthenticated(): boolean {
  return !!getToken();
}

// TODO: Implement getUserIdFromToken (TDD Section 2.1.2)
// Decodes JWT payload (base64) and returns sub (user UUID)
export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  // TODO: Implement base64 decode of JWT payload section
  throw new Error('Not implemented - see TDD Section 2.1.2');
}
