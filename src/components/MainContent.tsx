"use client";

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
const pathname = usePathname();
const isHomePage = pathname === '/';

const paddingTopClass = isHomePage ? 'pt-0' : '';

return (
  <main className={`main-content bg-[var(--barva-svetle-pozadi)] ${paddingTopClass}`}>
    {children}
  </main>
  );
}