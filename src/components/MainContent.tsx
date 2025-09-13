"use client";

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Na homepage přidáme pt-0 (nebo žádný padding), jinde přidáme pt-32 (nebo kolik potřebujete)
  const paddingTopClass = isHomePage ? 'pt-0' : 'pt-28 pb-28';

  return (
    <main className={`main-content bg-[var(--barva-svetle-pozadi)] ${paddingTopClass}`}>
      {children}
    </main>
  );
}