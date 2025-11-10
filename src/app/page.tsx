import type { Metadata } from 'next'
import HomepageClient from './HomepageClient' 

export const metadata: Metadata = {
  title: 'RiseHigh | Propojení talentů a startupů',
  description: 'Platforma, kde talentovaní studenti potkávají inovativní startupy skrze reálné výzvy a projekty. Získej praxi, buduj portfolio a nastartuj kariéru.',
  openGraph: {
    title: 'RiseHigh | Propojení talentů a startupů',
    description: 'Získej praxi a propoj se s inovativními firmami.',
    // images: ['https://www.risehigh.io/og.png'], 
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RiseHigh | Propojení talentů a startupů',
    description: 'Získej praxi a propoj se s inovativními firmami.',
    // images: ['https://www.risehigh.io/twitter.png'],
  },
};

export default function HomePage() {
  return <HomepageClient />;
}