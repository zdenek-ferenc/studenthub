"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Briefcase, Rocket, UserCircle } from 'lucide-react';


const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <Link href={href} className="flex-1 flex flex-col items-center justify-center gap-1 text-center group">
            <Icon size={24} className={`transition-colors ${isActive ? 'text-[var(--barva-primarni)]' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-[var(--barva-primarni)]' : 'text-gray-500 group-hover:text-gray-700'}`}>
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
        { href: '/dashboard', icon: LayoutDashboard, label: 'Přehled' },
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
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 md:hidden">
            <div className="w-full h-full max-w-md mx-auto flex items-center justify-around pb-2">
                {links.map(link => (
                    <NavItem key={link.href} {...link} />
                ))}
            </div>
        </nav>
    );
}