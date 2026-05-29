/**
 * Pet profile creation form — presented during onboarding after first login.
 * Collects pet name, age, gender, adoption details, and medical history.
 * On submit calls POST /pets. See TDD Section 2.3.1 for API contract.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import type { Pet } from '@/lib/types';

// TODO: Implement pet creation form (TDD Section 2.3.1)
// Required fields: name, age_months, gender, neutered_spayed
// Optional fields: breed, adoption_date, source, sibling_bonded, medical_history, household_context
// On success: redirect to /dashboard
export default function OnboardingPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement (TDD Section 2.3.1)
    throw new Error('Not implemented - see TDD Section 2.3.1');
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-2">Tell us about your cat</h1>
      <p className="text-gray-600 mb-6">We&apos;ll use this to personalise your daily check-ins.</p>
      {/* TODO: Render multi-step pet creation form */}
      <p className="text-gray-500 text-sm">Form not yet implemented.</p>
    </div>
  );
}
