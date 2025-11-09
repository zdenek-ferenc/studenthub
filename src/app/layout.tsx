import type { Metadata } from 'next' 
import { Sora } from "next/font/google";
import ClientLayoutWrapper from './ClientLayoutWrapper'; 
import './globals.css';

const sora = Sora({
  subsets: ["latin"],
  variable: '--font-sora',
});

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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className={sora.variable}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}