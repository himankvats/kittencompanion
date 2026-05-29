/**
 * Step 1 of signup — collects email, first name, and last name.
 * On submit calls POST /auth/signup and redirects to /auth/verify.
 * See TDD Section 2.1.1 for API contract.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';

// TODO: Implement signup form (TDD Section 2.1.1)
// - Fields: email, first_name, last_name
// - On submit: call apiClient.signup({ email, first_name, last_name })
// - On success: redirect to /auth/verify and pass email in session/query
// - On error: display error message per TDD Section 2.7
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submit handler (TDD Section 2.1.1)
    throw new Error('Not implemented - see TDD Section 2.1.1');
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      {/* TODO: Render form with Input components and error display */}
      <p className="text-gray-500 text-sm">Form not yet implemented.</p>
    </div>
  );
}
