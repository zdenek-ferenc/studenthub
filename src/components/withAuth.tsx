"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        }
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <p className="text-center py-20">Načítání...</p>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
}
