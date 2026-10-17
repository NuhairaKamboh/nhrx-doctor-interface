'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoctor } from './api';

/** Returns the logged-in doctor, redirecting to /login if missing. */
export function useDoctor() {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  useEffect(() => {
    const d = getDoctor();
    if (!d) router.replace('/login');
    else setDoctor(d);
  }, [router]);
  return doctor;
}
