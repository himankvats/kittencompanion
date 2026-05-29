/**
 * Landing page — shown to unauthenticated visitors.
 * Explains the product value proposition and links to sign up.
 * See TDD Section 12.1 for frontend architecture.
 */

import Link from 'next/link';

// TODO: Implement landing page UI
// Should include:
//   - Hero section with product tagline
//   - Feature highlights (daily check-in, triage, vet summary)
//   - CTA button → /auth/signup
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Kitten Companion</h1>
      <p className="text-lg text-gray-600 mb-8">
        Track your new cat&apos;s health during their first 4 months at home.
      </p>
      {/* TODO: Replace with full landing page hero and feature sections */}
      <Link
        href="/auth/signup"
        className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
      >
        Get Started — It&apos;s Free
      </Link>
    </div>
  );
}
