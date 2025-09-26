"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PublicStudentProfileView from './PublicStudentProfileView';
import PublicStartupProfileView from './PublicStartupProfileView';

type ProfileData = {
  id: string;
  role: 'student' | 'startup';
};

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params.id as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const fetchProfileRole = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('User')
        .select(`id, role`)
        .eq('id', profileId)
        .single();

      if (error) {
        console.error("Chyba při načítání role profilu:", error);
        setError("Tento profil se nepodařilo najít.");
      } else if (data) {
        setProfileData(data as ProfileData);
      }
      
      setLoading(false);
    };

    fetchProfileRole();
  }, [profileId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profileData) {
    return <p className="text-center py-20 text-xl text-gray-600">{error || 'Profil nebyl nalezen.'}</p>;
  }

  if (profileData.role === 'student') {
    return <PublicStudentProfileView profileId={profileId} />;
  }

  if (profileData.role === 'startup') {
    return <PublicStartupProfileView profileId={profileId} />;
  }

  return <p className="text-center py-20">Tento profil nelze zobrazit.</p>;
}