"use client";

import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, loading, router]);

  return <LoadingSpinner />;
}

export default withAuth(ProfileRedirectPage);