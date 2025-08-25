"use client";

import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth'; // Importujeme našeho strážce

function ProfilePage() {
  // Díky strážci 'withAuth' máme 100% jistotu, že 'user' a 'profile' zde nebudou null.
  const { user, profile } = useAuth();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-4">Můj profil</h1>
      <p>Vítej, <span className="font-semibold">{profile?.email}</span>!</p>
      <p>Tvoje role je: <span className="font-semibold">{profile?.role}</span></p>
      <p className="text-sm text-gray-500 mt-2">ID: {user?.id}</p>
    </div>
  );
}

// Tady je ta magie: Exportujeme naši stránku "obalenou" do našeho strážce.
export default withAuth(ProfilePage);
