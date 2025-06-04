'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const handleSignOut = async () => {
    localStorage.removeItem('auth-state');
    sessionStorage.removeItem('auth-state');
    await signOut({ redirect: false });
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    user: session?.user,
    signIn: () =>
      signIn('auth0', {
        authorizationParams: {
          prompt: 'select_account',
        },
      }),
    signOut: handleSignOut,
  };
};
