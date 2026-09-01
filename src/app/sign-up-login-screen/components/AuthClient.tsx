'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthClient() {
  const router = useRouter();

  useEffect(() => {
    router?.replace('/student-login');
  }, [router]);

  return null;
}