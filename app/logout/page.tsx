'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Logout = () => {
  const { signOut, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [logoutCompleted, setLogoutCompleted] = useState(false);

  const handleLogout = () => {
    setLogoutCompleted(true);
    signOut();
  };

  // Check if user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {logoutCompleted ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
            <Loader2 className="mx-auto w-8 h-8 text-yellow-400 animate-spin mb-4" />
            <p className="text-gray-600">Please wait while your session is being cleared.</p>
          </>
        ) : isAuthenticated ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Sign Out</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to sign out?</p>
            <button
              onClick={handleLogout}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Already Signed Out</h1>
            <p className="text-gray-600 mb-4">Redirecting to homepage...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Logout;
