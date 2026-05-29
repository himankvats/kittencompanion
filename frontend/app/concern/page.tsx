/**
 * Acute concern page — shows the ConcernForm and streams the triage response.
 * Calls POST /concerns and displays severity + guidance to the owner.
 * See TDD Section 2.5.1 for API contract.
 */

'use client';

import { useState } from 'react';
import { ConcernForm } from '@/components/ConcernForm';
import { apiClient } from '@/lib/api';
import type { AcuteEvent } from '@/lib/types';

// TODO: Implement concern page (TDD Section 2.5.1)
// - Render ConcernForm (concern type selection + follow-up questions)
// - On submit: call apiClient.flagConcern(payload)
// - Display severity badge (manage_at_home | watch | call_vet_now)
// - Display Claude-generated response_text
// - Prompt follow-up resolution after 24h
export default function ConcernPage() {
  const [result, setResult] = useState<AcuteEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: unknown) => {
    // TODO: Implement (TDD Section 2.5.1)
    throw new Error('Not implemented - see TDD Section 2.5.1');
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Report a Concern</h1>
      {result ? (
        <div className="p-4 border rounded-lg">
          {/* TODO: Render severity badge and response_text */}
          <p>{result.severity}</p>
          <p>{result.response_text}</p>
        </div>
      ) : (
        <ConcernForm onSubmit={handleSubmit} loading={loading} />
      )}
    </div>
  );
}
