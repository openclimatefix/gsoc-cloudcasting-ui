'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
