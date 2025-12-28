"use client"; // Důležité pro interaktivitu akordeonů

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Linkedin, Instagram, Heart, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-[var(--barva-tmava)] text-white border-t border-white/10 mt-auto">
      
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
          
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
            <Link href="/" className="inline-block">
              <Image 
                src="/logowhite.svg" 
                alt="RiseHigh Logo" 
                width={160} 
                height={45} 
                className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity mx-auto lg:mx-0" 
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
              Budujeme budoucnost, kde talent potkává příležitost. Spojujeme studenty se startupy bez bariér.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <SocialLink href="https://www.linkedin.com/company/risehighio" icon={<Linkedin size={18} />} label="LinkedIn" />
              <SocialLink href="https://www.instagram.com/risehigh.io/" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="https://github.com/zdenek-ferenc/risehigh" icon={<Github size={18} />} label="GitHub" />
            </div>
          </div>

          <div className="hidden lg:grid lg:col-span-8 grid-cols-3 gap-8">
              <DesktopLinks />
          </div>

          <div className="lg:hidden col-span-1 space-y-3 mt-4">
            
            <MobileAccordion 
              title="Pro Talenty" 
              isOpen={openSection === 'talenty'} 
              onClick={() => toggleSection('talenty')}
            >
              <ul className="space-y-3 pb-4 pl-4 border-l border-white/10 ml-2">
                <FooterLink href="/register/student">Vytvořit profil</FooterLink>
                <FooterLink href="/challenges">Procházet výzvy</FooterLink>
                <FooterLink href="/startups">Seznam startupů</FooterLink>
                <FooterLink href="/dashboard">Můj Dashboard</FooterLink>
              </ul>
            </MobileAccordion>

            <MobileAccordion 
              title="Pro Startupy" 
              isOpen={openSection === 'startupy'} 
              onClick={() => toggleSection('startupy')}
            >
              <ul className="space-y-3 pb-4 pl-4 border-l border-white/10 ml-2">
                <FooterLink href="/register/startup">Registrovat firmu</FooterLink>
                <FooterLink href="/pricing">Ceník</FooterLink>
                <FooterLink href="/students">Katalog talentů</FooterLink>
                <FooterLink href="/challenges/create">Vytvořit výzvu</FooterLink>
              </ul>
            </MobileAccordion>

            <MobileAccordion 
              title="Společnost" 
              isOpen={openSection === 'spolecnost'} 
              onClick={() => toggleSection('spolecnost')}
            >
              <ul className="space-y-3 pb-4 pl-4 border-l border-white/10 ml-2">
                <FooterLink href="/about">O nás</FooterLink>
                <FooterLink href="/contact">Kontakt</FooterLink>
                <FooterLink href="/blog">Blog</FooterLink>
              </ul>
            </MobileAccordion>

          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[var(--barva-tmava-tmavsi)]/50 pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-500">
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-center md:text-left">
            <p>&copy; {currentYear} RiseHigh.</p>
            <span className="hidden md:inline">|</span>
            <Link href="/zasady-ochrany-udaju" className="hover:text-white transition-colors">Ochrana údajů</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Podmínky</Link>
          </div>

          <div className="flex items-center gap-1.5 opacity-80">
              <span>Made with</span>
              <Heart size={12} className="text-red-500 fill-red-500" />
              <span>in Ostrava</span>
          </div>

        </div>
      </div>
    </footer>
  );
}

function DesktopLinks() {
  return (
    <>
      <div>
        <h3 className="font-semibold text-lg mb-4 text-white">Pro Talenty</h3>
        <ul className="space-y-3">
          <FooterLink href="/register/student">Vytvořit profil</FooterLink>
          <FooterLink href="/challenges">Procházet výzvy</FooterLink>
          <FooterLink href="/startups">Seznam startupů</FooterLink>
          <FooterLink href="/dashboard">Můj Dashboard</FooterLink>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4 text-white">Pro Startupy</h3>
        <ul className="space-y-3">
          <FooterLink href="/register/startup">Registrovat firmu</FooterLink>
          <FooterLink href="/pricing">Ceník</FooterLink>
          <FooterLink href="/students">Katalog talentů</FooterLink>
          <FooterLink href="/challenges/create">Vytvořit výzvu</FooterLink>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4 text-white">Společnost</h3>
        <ul className="space-y-3">
          <FooterLink href="/about">O nás</FooterLink>
          <FooterLink href="/contact">Kontakt</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
        </ul>
      </div>
    </>
  );
}

function MobileAccordion({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={onClick} 
        className="flex items-center justify-between w-full py-3 text-left group"
      >
        <span className={`font-medium transition-colors ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
          {title}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--barva-primarni2)]' : ''}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}


function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-400 hover:text-[var(--barva-primarni2)] hover:pl-1 transition-all duration-200 text-sm flex items-center gap-2"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={label}
      className="bg-white/5 hover:bg-white/15 p-2 rounded-full text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
    >
      {icon}
    </a>
  );
}