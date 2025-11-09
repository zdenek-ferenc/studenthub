"use client";

import { useAuth } from '../../../contexts/AuthContext';
import withAuth from '../../../components/withAuth';
import StudentEditForm from './StudentEditForm';
import StartupEditForm from './StartupEditForm';   
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner'
import { ChevronLeft } from 'lucide-react'; 


function EditProfileView() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderForm = () => {
    if (profile?.role === 'student') {
      return <StudentEditForm />;
    }
    if (profile?.role === 'startup') {
      return <StartupEditForm />;
    }
    return <p>Váš profil nemá platnou roli pro úpravy.</p>;
  };

  return (
    <div className="flex flex-col md:mx-20 2xl:mx-28 3xl:mx-32 py-5 md:py-26 3xl:py-32 px-4">
        <div className="mb-4 sm:mb-8">
          <Link href="/profile" className="flex flex-row items-center gap-1 group w-fit">
            <span className="text-[var(--barva-primarni)] transition-colors group-hover:text-[var(--barva-primarni)]">
              <ChevronLeft size={25} />
            </span>
            <span className="text-gray-500 text-sm 3xl:text-base leading-none transition-colors group-hover:text-[var(--barva-primarni)]">
              Zpět na profil
            </span>
          </Link>
          </div>
              {renderForm()}
            </div>
  );
}

export default withAuth(EditProfileView);