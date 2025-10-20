"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Profile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, LogIn} from 'lucide-react';
import BottomNavBar from './BottomNavBar';


function LoggedOutBottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 md:hidden">
      <div className="w-full h-full max-w-md mx-auto flex items-center justify-around gap-4 px-4">
        <Link href="/welcome" className="flex-1 flex items-center justify-center gap-3 text-center group py-3 px-6 bg-[var(--barva-primarni)] hover:opacity-90 rounded-xl transition-opacity">
            <LogIn size={22} className="text-white" />
            <span className="text-base font-semibold text-white">Přihlásit se / Registrovat</span>
        </Link>
      </div>
    </nav>
  );
}


function PillSwitch({ role, pathname }: { role: 'student' | 'startup', pathname: string }) {
  const studentLinks = [
    { id: 'prehled', label: 'Přehled', href: '/dashboard' },
    { id: 'vyzvy', label: 'Výzvy', href: '/challenges' },
    { id: 'startupy', label: 'Startupy', href: '/startups' },
  ];
  const startupLinks = [
    { id: 'vyzvy', label: 'Výzvy', href: '/challenges' },
    { id: 'studenti', label: 'Studenti', href: '/students' },
  ];
  const links = role === 'student' ? studentLinks : startupLinks;
  return (
    <div className="p-1 md:p-1.5 gap-2 bg-white rounded-full shadow-md flex items-center">
      {links.map(link => (
        <Link key={link.id} href={link.href} className={`px-4 py-2 md:px-5 3xl:px-8 3xl:py-3 rounded-full text-[14px] 3xl:text-lg font-semibold transition-all duration-300 ease-in-out ${pathname.startsWith(link.href) ? 'bg-[var(--barva-primarni)] text-white ' : 'text-[var(--barva-tmava)] hover:inset-shadow-sm hover:bg-gray-50'}`}>{link.label}</Link>
      ))}
    </div>
  );
}
function ProfileCircle({ profile, pathname }: { profile: Profile, pathname: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [initials, setInitials] = useState('??');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && profile) {
            const fetchInitials = async () => {
                if (profile.role === 'student') {
                    const { data } = await supabase
                        .from('StudentProfile')
                        .select('first_name, last_name')
                        .eq('user_id', user.id)
                        .single();
                    if (data) {
                        const newInitials = `${data.first_name?.charAt(0) ?? ''}${data.last_name?.charAt(0) ?? ''}`.toUpperCase();
                        setInitials(newInitials || '??');
                    }
                } else if (profile.role === 'startup') {
                    const { data } = await supabase
                        .from('StartupProfile')
                        .select('company_name')
                        .eq('user_id', user.id)
                        .single();
                    if (data) {
                        const newInitials = data.company_name?.substring(0, 2).toUpperCase() || '??';
                        setInitials(newInitials);
                    }
                } else {
                    setInitials(profile.email?.substring(0, 2).toUpperCase() || '??');
                }
            };
            fetchInitials();
        }
    }, [user, profile]);

    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setIsOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [dropdownRef]);
    const isActive = pathname === `/profile/${user?.id}`;
    return (
        <div className="relative bg-white rounded-full" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={`w-10 h-10 3xl:w-12 3xl:h-12 rounded-full bg-gradient-to-b from-[#86C5FF]/30 to-[#86C5FF]/55 text-[var(--barva-primarni)] flex items-center justify-center font-bold cursor-pointer 3xl:text-lg hover:shadow-md transition-all ease-in duration-300 ${isActive ? 'ring-2 ring-[var(--barva-primarni)] leading-none' : ''}`}>{initials}</button>
            <div className={`absolute right-0 pt-2 transition-opacity duration-200 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="w-36 3xl:w-48 bg-white rounded-xl shadow-lg z-10">
                    <Link href={`/profile/${user?.id}`} className="block px-2 3xl:px-4 py-1.5 3xl:py-2 md:text-xs 3xl:text-sm text-gray-700 rounded-tr-xl rounded-tl-xl hover:bg-sky-50 transition-all ease-in-out duration-100" onClick={() => setIsOpen(false)}>Můj profil</Link>
                    <Link href="/profile/edit" className="block px-2 3xl:px-4 py-1.5 3xl:py-2 md:text-xs 3xl:text-sm text-gray-700 hover:bg-sky-50 transition-all ease-in-out duration-100" onClick={() => setIsOpen(false)}>Upravit profil</Link>
                    <button onClick={handleLogout} className="w-full cursor-pointer text-left block px-2 3xl:px-4 py-1.5 3xl:py-2 md:text-xs 3xl:text-sm rounded-br-xl rounded-bl-xl text-gray-700 hover:bg-sky-50 transition-all ease-in-out duration-100">Odhlásit se</button>
                </div>
            </div>
        </div>
    );
}
type Notification = { id: string; message: string; link_url: string; is_read: boolean; created_at: string; };
function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const fetchUnreadCount = useCallback(async () => { if (!user) return; const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false); setUnreadCount(count || 0); }, [user]);
    useEffect(() => { fetchUnreadCount(); const intervalId = setInterval(fetchUnreadCount, 60000); return () => clearInterval(intervalId); }, [user, fetchUnreadCount]);
    useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) { setIsOpen(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => { document.removeEventListener("mousedown", handleClickOutside); }; }, [notificationRef]);
    const onBellClick = async () => { if (!user) return; setIsOpen(!isOpen); if (!isOpen) { setIsLoading(true); const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5); setNotifications(data || []); setIsLoading(false); if (unreadCount > 0) { await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false); setUnreadCount(0); } } };
    return (
        <div className="relative" ref={notificationRef}>
            <button onClick={onBellClick} className="relative bg-[var(--barva-svetle-pozadi)] p-2 rounded-full cursor-pointer transition-colors"><Bell className="w-5 h-5 3xl:w-5 3xl:h-5 text-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] transition-all ease-in duration-100" />{unreadCount > 0 && (<span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>)}</button>
            {isOpen && (<div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg z-20 bg-white border border-gray-100"><div className="py-2 px-4 rounded-t-xl font-semibold text-white bg-[var(--barva-primarni)] border-b border-[var(--barva-primarni2)]">Notifikace</div><div className="flex flex-col">{isLoading ? (<p className="p-4 text-sm text-gray-500">Načítám...</p>) : notifications.length > 0 ? (notifications.map(notif => (<Link key={notif.id} href={notif.link_url} onClick={() => setIsOpen(false)} className="p-4 text-sm text-gray-700 hover:bg-sky-100 border-b border-[var(--barva-primarni2)] last:border-b-0">{notif.message}</Link>))) : (<p className="p-4 text-sm text-gray-500">Zatím žádné novinky.</p>)}</div><div className="p-2 bg-gray-50 flex justify-center items-center rounded-b-xl leading-none"><Link href="/notifications" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-[var(--barva-primarni)]">Zobrazit všechny</Link></div></div>)}
        </div>
    );
}


export default function Header() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = pathname === '/';

  const isRegistrationFlow = pathname.startsWith('/register');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showBackground = !isHomePage || scrolled;

  if (loading) {
    return null;
  }

  if (user && isRegistrationFlow) {
    return null;
  }

  return (
    <>
      <header className={`hidden md:block fixed w-full top-0 z-50`}>
        <div className={`absolute inset-0 bg-white/0 backdrop-blur-md transition-opacity duration-300 ${showBackground ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className="relative mx-auto container px-17 2xl:px-32 3xl:px-36 flex justify-between items-center h-24 3xl:h-30">
          <div className="flex-1 flex justify-start">
            {isRegistrationFlow ? (
              <div className="cursor-default">
                <Image src="/logo.svg" alt="logo" width={200} height={80} className="w-auto h-6 lg:h-8 3xl:h-10" />
              </div>
            ) : (
              <Link href="/">
                <Image src="/logo.svg" alt="logo" width={200} height={80} className="w-auto h-6 lg:h-8 3xl:h-10" />
              </Link>
            )}
          </div>
          
          <div className="hidden md:flex flex-1 justify-center">
            {!loading && user && profile && (profile.role === 'student' || profile.role === 'startup') && (
              <PillSwitch role={profile.role} pathname={pathname} />
            )}
          </div>
          <div className="hidden md:flex flex-1 justify-end">
            {!loading && (
              user && profile ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <ProfileCircle profile={profile} pathname={pathname} />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="px-5 py-2.5 rounded-full text-xs lg:text-base font-medium text-[var(--barva-tmava)] bg-gray-100 hover:bg-gray-200">Přihlásit se</Link>
                  <Link href="/register" className="px-5 py-2.5 rounded-full text-xs lg:text-base font-medium bg-[var(--barva-primarni)] text-white hover:opacity-90">Registrovat</Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>
      {!loading && (
      user && profile 
    ? <BottomNavBar /> 
    : (!pathname.startsWith('/register') && pathname !== '/welcome' && <LoggedOutBottomNavBar />)
)}
    </>
  );
}