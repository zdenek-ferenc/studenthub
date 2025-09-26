"use client";

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Na homepage je odsazení 0, na ostatních stránkách pt-28 (kvůli výšce headeru)
  const paddingTopClass = isHomePage ? 'pt-0' : 'pt-8 md:pt-28';

  // Na mobilu přidáme odsazení zespodu (pb-24) kvůli spodní liště
  return (
    <main className={`main-content bg-[var(--barva-svetle-pozadi)] ${paddingTopClass} pb-24 md:pb-12`}>
      {children}
    </main>
  );
}