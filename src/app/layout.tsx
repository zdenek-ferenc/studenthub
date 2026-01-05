import type { Metadata, Viewport } from 'next';
import { sora } from './fonts';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EFF8FF', 
};

export const metadata: Metadata = {
  title: {
    template: '%s | RiseHigh',
    default: 'RiseHigh | Propojení talentů a startupů',
  },
  description: 'Platforma, kde talentovaní studenti potkávají inovativní startupy skrze reálné výzvy a projekty. Získej praxi, buduj portfolio a nastartuj kariéru.',
  openGraph: {
    title: 'RiseHigh | Propojení talentů a startupů',
    description: 'Získej praxi a propoj se s inovativními firmami.',
    // TODO: Vytvořit obrázky a nahrát je tu
    // images: ['https://www.risehigh.io/og.png'], 
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RiseHigh | Propojení talentů a startupů',
    description: 'Získej praxi a propoj se s inovativními firmami.',
    // TODO: Vytvořit obrázky a nahrát je tu
    // images: ['https://www.risehigh.io/twitter.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={sora.variable}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}