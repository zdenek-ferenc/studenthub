"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useAuth, Profile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Malá komponenta pro "pilulkový" přepínač
function PillSwitch({ role }: { role: 'student' | 'startup' }) {
  const [active, setActive] = useState('vyzvy');

  const studentLinks = [
    { id: 'vyzvy', label: 'Výzvy', href: '/challenges' },
    { id: 'startupy', label: 'Startupy', href: '/startups' },
  ];
  const startupLinks = [
    { id: 'vyzvy', label: 'Výzvy', href: '/challenges' },
    { id: 'studenti', label: 'Studenti', href: '/students' },
  ];
  const links = role === 'student' ? studentLinks : startupLinks;

  return (
    <div className="bg-white p-1.5 rounded-full shadow-md flex items-center">
      {links.map(link => (
        <Link
          key={link.id}
          href={link.href}
          onClick={() => setActive(link.id)}
          // ZVĚTŠENO: Větší padding a písmo
          className={`px-8 py-3 rounded-full text-lg font-semibold transition-colors
            ${active === link.id ? 'bg-[var(--barva-primarni)] text-white' : 'text-[var(--barva-tmava)] hover:bg-gray-100'}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// Malá komponenta pro profilové kolečko
function ProfileCircle({ profile }: { profile: Profile }) {
    const router = useRouter();
    const initials = profile?.email?.substring(0, 2).toUpperCase() || '??';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    }

    return (
        <div className="relative group">
            {/* ZVĚTŠENO: Větší kolečko */}
            <button className="w-12 h-12 rounded-full bg-[var(--barva-primarni)] text-white flex items-center justify-center font-bold cursor-pointer text-lg">
                {initials}
            </button>
            <div className="absolute right-0 pt-2 hidden group-hover:block">
                <div className="w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Můj profil</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Odhlásit se</button>
                </div>
            </div>
        </div>
    );
}


export default function Header() {
  // Získáme data o přihlášení z našeho Contextu
  const { user, profile, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      {/* Tento nový prvek je POUZE pro pozadí, blur a masku. */}
      <div className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,white_80%,transparent)]"></div>
      
      {/* Obsah je nyní nad pozadím díky 'relative' a není ovlivněn maskou. */}
      <div className="relative container mx-auto px-4 grid grid-cols-3 items-center py-6">
        {/* Levá část: Logo */}
        <div className="justify-self-start">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            <Image
                  src="/logo.svg"
                  alt="logo"
                  width={200} // Zvětšeno pro lepší kvalitu
                  height={50}  // Zvětšeno pro lepší kvalitu
                  // ZVĚTŠENO: Větší šířka loga
                  className="w-18 h-auto"
                />
          </Link>
        </div>
        
        {/* Prostřední část: Přepínač */}
        <div className="justify-self-center">
          {!loading && user && profile && (profile.role === 'student' || profile.role === 'startup') && (
            <PillSwitch role={profile.role} />
          )}
        </div>

        {/* Pravá část: Profil nebo přihlašovací tlačítka */}
        <div className="justify-self-end">
          {!loading && (
            user && profile ? (
              <ProfileCircle profile={profile} />
            ) : (
              <div className="flex items-center space-x-4">
                {/* ZVĚTŠENO: Větší tlačítka a písmo */}
                <Link href="/login" className="px-5 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Přihlásit se</Link>
                <Link href="/register/student" className="px-5 py-2.5 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700">Registrovat</Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
