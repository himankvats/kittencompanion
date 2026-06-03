'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from './context';

export function useAuthGuard() {
  const { user, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  return { user, loading };
}

export function useOTPTimer(initial = 60) {
  const [timer, setTimer] = useState(initial);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setTimer(initial);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          if (ref.current) clearInterval(ref.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    start();
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, []);

  return { timer, restart: start };
}
