/**
 * Main dashboard shown after login. Displays pet status summary and recent check-ins.
 * Fetches pet data and latest check-in from the API on load.
 * See TDD Section 2.3 and 2.4 for the data shape.
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { Pet, CheckIn } from '@/lib/types';

// TODO: Implement dashboard page (TDD Section 2.3.2, 2.4.2)
// - On mount: check isAuthenticated(); redirect to /auth/signup if not
// - Fetch user's pets via apiClient.listPets(userId)
// - Fetch recent check-ins via apiClient.getCheckinHistory(petId, { limit: 7 })
// - Show today's check-in status and quick-submit button
// - Show most recent concern (if any)
export default function DashboardPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement data fetching and auth guard
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* TODO: Implement dashboard UI components */}
      <p className="text-gray-500 text-sm">Dashboard not yet implemented.</p>
    </div>
  );
}
