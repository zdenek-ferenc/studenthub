"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, Briefcase, Rocket, UserCircle } from 'lucide-react';

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    return (
        <Link href={href} className="flex-1 relative flex flex-col items-center rounded-xl justify-center gap-1 py-2 group">
            {isActive && (
                <span className="absolute inset-0 bg-[var(--barva-primarni)]/10 rounded-xl -z-10 scale-90 transition-transform duration-300" />
            )}
            <Icon 
                size={24} 
                className={`transition-all duration-300 ${
                    isActive 
                        ? 'text-[var(--barva-primarni)] scale-110' 
                        : 'text-gray-500 group-hover:text-gray-600 group-active:scale-95'
                }`} 
            />
            <span className={`text-[10px] font-bold transition-colors duration-300 ${
                isActive 
                    ? 'text-[var(--barva-primarni)]' 
                    : 'text-gray-500 group-hover:text-gray-600'
            }`}>
                {label}
            </span>
        </Link>
    );
};

export default function BottomNavBar() {
    const { profile, user } = useAuth();

    if (!profile || !user) {
        return null; 
    }
    
    const studentLinks = [
        { href: '/dashboard', icon: LayoutGrid, label: 'Přehled' },
        { href: '/challenges', icon: Briefcase, label: 'Výzvy' },
        { href: '/startups', icon: Rocket, label: 'Startupy' },
        { href: `/profile/${user.id}`, icon: UserCircle, label: 'Profil' }
    ];

    const startupLinks = [
        { href: '/challenges', icon: Briefcase, label: 'Výzvy' },
        { href: '/students', icon: Rocket, label: 'Studenti' },
        { href: `/profile/${user.id}`, icon: UserCircle, label: 'Profil' }
    ];

    const links = profile.role === 'student' ? studentLinks : startupLinks;

    return (
        <nav className="fixed bottom-4 left-2 right-2 h-20 bg-white/60 backdrop-blur-sm border-2 border-gray-100 rounded-2xl z-50 md:hidden overflow-hidden">
            <div className="w-full h-full flex items-center justify-around px-2">
                {links.map(link => (
                    <NavItem key={link.href} {...link} />
                ))}
            </div>
        </nav>
    );
}