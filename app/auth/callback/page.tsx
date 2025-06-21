'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const returnTo = searchParams.get('returnTo');
        router.push(returnTo || '/');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Loader2 className="animate-spin h-12 w-12 text-yellow-500" />
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <Loader2 className="animate-spin h-12 w-12 text-yellow-500" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
