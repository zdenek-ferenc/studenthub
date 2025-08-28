"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import withAuth from '../../../components/withAuth'; // Uprav cestu
import CreateChallengeForm from './CreateChallengeForm'; // Importujeme náš hotový formulář

function CreateChallengePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  // Během načítání zobrazíme jednoduchou zprávu
  if (loading) {
    return <p className="text-center py-20">Načítání...</p>;
  }

  // Bezpečnostní kontrola: Pokud uživatel není startup, přesměrujeme ho pryč.
  if (profile && profile.role !== 'startup') {
    // Je lepší vrátit null a nechat withAuth, aby se postaral o přesměrování,
    // ale pro jistotu to zde máme.
    router.push('/');
    return null;
  }

  return (
      <div className="container mx-auto">
        <div>
            <div className="sm:px-12 rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                  {/* Zde může být v budoucnu např. tlačítko pro uložení jako koncept */}
              </div>
              <CreateChallengeForm />
            </div>
        </div>
      </div>
  );
}

export default withAuth(CreateChallengePage);
