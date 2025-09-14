"use client";

import { useState, useEffect, useRef,useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Profile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell } from 'lucide-react'; // Přidán import pro ikonu zvonečku

// Komponenta PillSwitch zůstává 1:1, nedotčeno
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
    <div className="p-1.5 gap-2 bg-white rounded-full shadow-md flex items-center">
      {links.map(link => (
        <Link
          key={link.id}
          href={link.href}
          className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
            ${pathname.startsWith(link.href) ? 'bg-[var(--barva-primarni)] text-white' : 'text-[var(--barva-tmava)] hover:inset-shadow-sm hover:bg-gray-50'}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// Komponenta ProfileCircle s toggle chováním
function ProfileCircle({ profile, pathname }: { profile: Profile, pathname: string }) {
    const router = useRouter();
    const initials = profile?.email?.substring(0, 2).toUpperCase() || '??';
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const isActive = pathname.startsWith('/profile');

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`w-12 h-12 rounded-full bg-[#86C5FF] text-[var(--barva-primarni)] flex items-center justify-center font-bold cursor-pointer text-lg hover:shadow-md transition-all ease-in duration-300
              ${isActive ? 'ring-2 ring-[var(--barva-primarni)] leading-none' : ''}
            `}>
                {initials}
            </button>
            <div className={`absolute right-0 pt-2 transition-opacity duration-200 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="w-48 bg-white rounded-xl shadow-lg py-1 z-10">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-100" onClick={() => setIsOpen(false)}>Můj profil</Link>
                    <Link href="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-100" onClick={() => setIsOpen(false)}>Upravit profil</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm rounded-xl text-gray-700 hover:bg-gray-100">Odhlásit se</button>
                </div>
            </div>
        </div>
    );
}

// --- NOVÁ KOMPONENTA PRO NOTIFIKACE (přidáno zpět) ---
type Notification = {
    id: string;
    message: string;
    link_url: string;
    is_read: boolean;
    created_at: string;
};

// Tento kód patří do souboru src/components/Header.tsx

// --- NOVÁ, OPTIMALIZOVANÁ KOMPONENTA S POLLINGEM ---
function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Tato funkce se zeptá na počet nepřečtených notifikací.
    // Budeme ji volat opakovaně.
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        setUnreadCount(count || 0);
    }, [user]); // Závislost na 'user', aby se funkce aktualizovala při přihlášení/odhlášení

    // Tento useEffect nastaví minutový interval pro kontrolu notifikací.
    useEffect(() => {
        // První kontrolu provedeme hned po načtení komponenty.
        fetchUnreadCount();

        // Nastavíme interval, který bude volat fetchUnreadCount každých 60 sekund.
        const intervalId = setInterval(() => {
            fetchUnreadCount();
        }, 60000); // 60 000 milisekund = 1 minuta

        // Klíčová část: "úklidová" funkce.
        // Když se komponenta odpojí (uživatel se odhlásí), interval se zruší.
        // Tím zabráníme memory leakům.
        return () => clearInterval(intervalId);

    }, [user, fetchUnreadCount]); // Spustí se znovu, pokud se změní uživatel.
    
    // Zůstává pro zavírání dropdownu po kliknutí mimo
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);

    // Logika pro kliknutí na zvoneček zůstává stejná
    const onBellClick = async () => {
        if (!user) return;
        setIsOpen(!isOpen);

        if (!isOpen) { 
            setIsLoading(true);
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);
            setNotifications(data || []);
            setIsLoading(false);

            if (unreadCount > 0) {
                 await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('user_id', user!.id)
                    .eq('is_read', false);
                setUnreadCount(0);
            }
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            <button onClick={onBellClick} className="relative p-2 rounded-full cursor-pointer transition-colors">
                <Bell className="w-6 h-6 text-[#86C5FF] hover:scale-110 transition-all ease-in duration-100" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-[#ff4d4d] ring-2 ring-white"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg z-20 bg-white border border-white">
                    <div className="py-2 px-4 rounded-t-xl font-semibold text-white bg-[var(--barva-primarni)]">Notifikace</div>
                    <div className="flex flex-col">
                        {isLoading ? (
                            <p className="p-4 text-sm text-gray-500">Načítám...</p>
                        ) : notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link key={notif.id} href={notif.link_url} onClick={() => setIsOpen(false)} className="p-4 text-sm text-gray-700 hover:bg-gray-50 border-b border-[var(--barva-primarni2)] last:border-b-0">
                                    {notif.message}
                                </Link>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">Zatím žádné novinky.</p>
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 flex justify-center items-center rounded-b-xl leading-none">
                        <Link href="/notifications" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-[var(--barva-primarni)]">
                            Zobrazit všechny
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// Hlavní komponenta Header
export default function Header() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const positionClass = isHomePage ? 'fixed w-full' : 'fixed w-full';
  const showBackground = !isHomePage || scrolled;

  return (
    <header className={`${positionClass} top-0 z-50`}>
      <div className={`absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,white_100%,transparent)] transition-opacity duration-300 ${showBackground ? 'opacity-100' : 'opacity-0'}`}></div>
      
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
            <PillSwitch role={profile.role} pathname={pathname} />
          )}
        </div>

        <div className="justify-self-end">
          {!loading && (
            user && profile ? (
              // ZDE JE ZMĚNA: Přidán zvoneček vedle profilu
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <ProfileCircle profile={profile} pathname={pathname} />
              </div>
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

