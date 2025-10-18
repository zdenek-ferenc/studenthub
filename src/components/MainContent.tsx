"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paddingTopClass, setPaddingTopClass] = useState('');

  useEffect(() => {
    const isHomePage = pathname === '/';
    setPaddingTopClass(isHomePage ? 'pt-0' : '');
  }, [pathname]); 

  return (
    <main className={`main-content bg-[var(--barva-svetle-pozadi)] ${paddingTopClass}`}>
      {children}
    </main>
  );
}