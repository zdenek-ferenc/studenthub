"use client";
import Link from 'next/link';
// OPRAVA: Přidali jsme importy pro 'useState' a 'usePathname'
import { usePathname } from 'next/navigation';
import { useAuth, Profile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Komponenta teď přijímá 'pathname' pro určení aktivního odkazu
function PillSwitch({ role, pathname }: { role: 'student' | 'startup', pathname: string }) {
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
    <div className="bg-white p-1.5 gap-2 rounded-full shadow-md flex items-center">
      {links.map(link => (
        <Link
          key={link.id}
          href={link.href}
          // OPRAVA: Aktivní stav se teď řídí podle aktuální URL
          className={`px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#0069ccde] transition-all duration-300 ease-in-out
            ${pathname.startsWith(link.href) ? 'bg-[var(--barva-primarni)] text-white' : 'text-[var(--barva-tmava)] hover:bg-gray-100'}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// Komponenta teď přijímá 'pathname' pro zvýraznění
function ProfileCircle({ profile, pathname }: { profile: Profile, pathname: string }) {
    const router = useRouter();
    const initials = profile?.email?.substring(0, 2).toUpperCase() || '??';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    }

    // OPRAVA: Přidali jsme podmíněnou třídu pro modrý rámeček
    const isActive = pathname === '/profile';

    return (
        <div className="relative group">
            <button className={`w-12 h-12 rounded-full bg-[#86C5FF] text-[var(--barva-primarni)] flex items-center justify-center font-bold cursor-pointer text-lg hover:opacity-90 transition-all
              ${isActive ? 'ring-2 ring-[var(--barva-primarni)] leading-none' : ''}
            `}>
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
  const { user, profile, loading } = useAuth();
  // OPRAVA: Získáme aktuální cestu z URL
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,white_80%,transparent)]"></div>
      
      <div className="relative container mx-auto px-4 grid grid-cols-3 items-center py-6">
        <div className="justify-self-start">
          <Link href="/">
            <Image
                  src="/logo.svg"
                  alt="logo"
                  width={200}
                  height={50}
                  className="w-18 h-auto"
                />
          </Link>
        </div>
        
        <div className="justify-self-center">
          {!loading && user && profile && (profile.role === 'student' || profile.role === 'startup') && (
            // OPRAVA: Předáváme 'pathname' do komponenty
            <PillSwitch role={profile.role} pathname={pathname} />
          )}
        </div>

        <div className="justify-self-end">
          {!loading && (
            user && profile ? (
              // OPRAVA: Předáváme 'pathname' do komponenty
              <ProfileCircle profile={profile} pathname={pathname} />
            ) : (
              <div className="flex items-center space-x-4">
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
