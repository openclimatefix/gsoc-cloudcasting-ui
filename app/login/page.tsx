'use client';

import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authInitiated, setAuthInitiated] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/');
      } else if (!authInitiated) {
        setAuthInitiated(true);
        signIn();
      }
    }
  }, [isAuthenticated, isLoading, router, signIn, authInitiated]);

  return <></>;
};

export default Login;
