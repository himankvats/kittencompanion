'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Pet } from './types';
import { isAuthenticated, getUserIdFromToken } from './auth';
import { getUser, listPets } from './api';

interface AppContextValue {
  user: User | null;
  pet: Pet | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setPet: (p: Pet | null) => void;
  refresh: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    setLoading(true);
    if (!isAuthenticated()) {
      setUser(null);
      setPet(null);
      setLoading(false);
      return;
    }
    const userId = getUserIdFromToken();
    if (!userId) {
      setUser(null);
      setPet(null);
      setLoading(false);
      return;
    }
    try {
      const [fetchedUser, petsRes] = await Promise.all([
        getUser(userId),
        listPets(userId),
      ]);
      setUser(fetchedUser);
      setPet(petsRes.pets[0] ?? null);
    } catch {
      setUser(null);
      setPet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <AppContext.Provider value={{ user, pet, loading, setUser, setPet, refresh: hydrate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
