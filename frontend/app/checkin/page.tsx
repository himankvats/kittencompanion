/**
 * Daily check-in page — displays the CheckInForm and handles submission.
 * Calls POST /checkins and shows the feedback_text on success.
 * See TDD Section 2.4.1 for API contract.
 */

'use client';

import { useState } from 'react';
import { CheckInForm } from '@/components/CheckInForm';
import { apiClient } from '@/lib/api';
import type { CheckIn } from '@/lib/types';

// TODO: Implement check-in page (TDD Section 2.4.1)
// - Fetch user's active pet(s) to determine petId
// - Render CheckInForm
// - On submit: call apiClient.createCheckin(payload)
// - On success: display feedback_text from response
// - On UNIQUE_CONSTRAINT (duplicate day): show "Already checked in today" message
export default function CheckInPage() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Omit<CheckIn, 'id' | 'date' | 'created_at'>) => {
    // TODO: Implement (TDD Section 2.4.1)
    throw new Error('Not implemented - see TDD Section 2.4.1');
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Daily Check-in</h1>
      {feedback ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {feedback}
        </div>
      ) : (
        <CheckInForm onSubmit={handleSubmit} loading={loading} />
      )}
    </div>
  );
}
