"use client";

import { useAuth } from '../../../contexts/AuthContext';
import withAuth from '../../../components/withAuth';
import StudentEditForm from './StudentEditForm';
import StartupEditForm from './StartupEditForm';   
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner'
import { ChevronLeft } from 'lucide-react'; 


function EditProfilePage() {
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
    <div className="container mx-auto py-10 md:py-32 px-4">
        <div className="mb-4 sm:mb-8">
            <div className='flex flex-row items-center gap-1'>
            <span className='text-[var(--barva-primarni)]'>
              <ChevronLeft size={25}/>
            </span>
            <Link href="/profile" className="text-gray-500 hover:text-[var(--barva-primarni)] transition-colors">Zpět na profil</Link>
            </div>
            <h1 className="text-4xl font-bold text-[var(--barva-tmava)] mt-2">Upravit profil</h1>
        </div>
        {renderForm()}
    </div>
  );
}

export default withAuth(EditProfilePage);