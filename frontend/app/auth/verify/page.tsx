/**
 * OTP verification page — user enters the 6-digit code from their email.
 * On submit calls POST /auth/verify and stores the returned JWT.
 * See TDD Section 2.1.2 for API contract.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { setToken } from '@/lib/auth';

// TODO: Implement OTP verification form (TDD Section 2.1.2)
// - Field: otp_token (6-digit code)
// - On submit: call apiClient.verifyOTP({ otp_token })
// - On success: store JWT via setToken(), redirect to /dashboard or /onboarding/pet
// - On error: display INVALID_OTP error
export default function VerifyPage() {
  const router = useRouter();
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submit handler (TDD Section 2.1.2)
    throw new Error('Not implemented - see TDD Section 2.1.2');
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Verify your email</h1>
      <p className="text-gray-600 mb-4">Enter the 6-digit code sent to your email.</p>
      {/* TODO: Render OTP input and submit button */}
      <p className="text-gray-500 text-sm">Form not yet implemented.</p>
    </div>
  );
}
