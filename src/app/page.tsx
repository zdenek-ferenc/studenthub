"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Target,
  FileText,
  Award,
  TrendingUp,
  LayoutGrid,
  Users,
} from 'lucide-react';
import ScrollAnimator from '../components/ScrollAnimator';

import DemoChallengeView from '../components/homepage-demos/DemoChallengeView';
import DemoTalentView from '../components/homepage-demos/DemoTalentView';
import DemoCareerGrowthWidget from '../components/homepage-demos/DemoCareerGrowthWidget';
import DemoStudentFeatures from '../components/homepage-demos/DemoStudentFeatures';
import DemoStartupFeatures from '../components/homepage-demos/DemoStartupFeatures';

const HowItWorksStep = ({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) => (
  <div className="bg-white/60 backdrop-blur-lg p-4 md:p-6 rounded-3xl shadow-sm border-2 border-gray-100 h-full">
    <div className='flex md:items-start items-center gap-4 md:flex-col pb-4 md:pb-0'>
      <div className="w-10 h-10 md:w-14 md:h-14 bg-[var(--barva-primarni)] text-white rounded-xl md:rounded-2xl flex items-center justify-center md:mb-5 shadow-lg">
      <Icon size={32} />
    </div>
    <h3 className="text-lg xl:text-2xl font-bold mb-3">{title}</h3>
    </div>
    
    <p className="text-gray-700 text-sm xl:text-base">{text}</p>
  </div>
);

const ValuePropColumn = ({
  title,
  features,
}: {
  title: string;
  features: string[];
}) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 h-full">
    <h3 className="text-3xl font-bold tracking-tight mb-6 flex justify-center items-center gap-3">
      {title} <span className="text-center text-2xl"></span>
    </h3>
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
          <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700 text-sm md:text-lg">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FinalCtaCard = ({
  href,
  title,
  description,
  buttonText,
  isPrimary,
}: {
  href: string;
  title: string;
  description: string;
  buttonText: string;
  isPrimary: boolean;
}) => (
  <div
    className={`p-8 rounded-3xl h-full flex flex-col ${
      isPrimary
        ? 'bg-gradient-to-br from-[var(--barva-tmava)] to-[#002952] text-white'
        : 'bg-white shadow-lg border border-gray-100'
    }`}
  >
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className={`flex-1 ${isPrimary ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
    <Link
      href={href}
      className={`mt-6 inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-base font-semibold shadow-md transition-all duration-300 transform group ${
        isPrimary
          ? 'bg-[var(--barva-primarni)] text-white hover:bg-[var(--barva-primarni)]/80 hover:shadow-none'
          : 'bg-white text-[var(--barva-primarni)] border-2 border-[var(--barva-primarni)] hover:bg-gray-50'
      }`}
    >
      {buttonText}
      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
    </Link>
  </div>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('challenges');

  const logos = [
    { src: '/unklogo.png', alt: 'Unknown Agency' },
    { src: '/vutlogo.png', alt: 'VUT' },
    { src: '/sporteralogo.png', alt: 'Sportera' },
    { src: '/contributelogo.png', alt: 'Contribute' },
    { src: '/renownlogo.png', alt: 'Renown Media' },
    { src: '/obzoremlogo.svg', alt: 'Studio Obzorem' },
    { src: '/vdlogo.svg', alt: 'Virtigo Digital' }
  ];


  return (
    <div className="w-full overflow-x-hidden text-[var(--barva-tmava)] !pt-0">
      <header className="relative h-[90vh] sm:h-screen flex items-center justify-center text-white bg-[var(--barva-tmava)] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 smooth-shimmer-bg opacity-40"></div>
        </div>
        <div className="container mx-auto text-center relative z-10 px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl 3xl:text-8xl font-extrabold tracking-tighter leading-tight">
            <div className="overflow-hidden">
              <div className="animate-slide-in-reveal delay-100">Praxe, co má smysl.</div>
            </div>
            <div className="overflow-hidden">
              <span className="text-[var(--barva-hero)] animate-slide-in-reveal delay-200">Talent, co mění hru.</span>
            </div>
          </h1>
          <div className="overflow-hidden mt-6">
            <p className="max-w-3xl mx-auto text-base sm:text-lg 3xl:text-xl text-gray-300 leading-relaxed animate-slide-in-reveal delay-300">
              Propojujeme nejlepší studenty s inovativními startupy skrze reálné projekty.
            </p>
          </div>
          <div className="overflow-hidden mt-10">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 animate-slide-in-reveal delay-400">
              <Link
                href="/register/student"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--barva-primarni)] text-lg text-white font-semibold shadow-lg hover:bg-[#0058aa] hover:shadow-none transition-all duration-300 flex justify-center items-center"
              >
                Chci výzvu
              </Link>
              <Link
                href="/register/startup"
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-[var(--barva-primarni)] text-lg text-white font-semibold shadow-lg hover:bg-[#00284d] hover:shadow-none transition-all duration-500 flex justify-center items-center"
              >
                Hledám talent
              </Link>
            </div>
          </div>
          
          <div className=" md:w-4/5 mx-auto mt-22">
            <div className="container mx-auto px-4 sm:px-6">
              <p className="text-sm text-center text-gray-200 uppercase tracking-widest mb-6">
                Důvěřují nám partneři z praxe
              </p>
              <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <div className="flex w-max animate-marquee">
                  {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
                    <div key={index} className="md:w-48 px-4 md:px-10 flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={140}
                        height={50}
                        className="h-7 md:h-12 w-auto object-contain"
                        priority 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-32 bg-[var(--barva-svetle-pozadi)]">
          <div className="w-5/6 3xl:w-4/5 mx-auto px-4 sm:px-6">
            <ScrollAnimator>
              <div className="text-center mb-6 md:mb-16">
                <h2 className="text-3xl md:text-4xl 3xl:text-5xl font-bold tracking-tight">Jednoduchý proces, maximální dopad</h2>
                <p className="mt-4 max-w-2xl mx-auto md:text-lg text-gray-600">Náš ověřený 3-krokový proces zaručuje výsledky pro obě strany.</p>
              </div>
            </ScrollAnimator>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <ScrollAnimator delay={0}>
                <HowItWorksStep
                  icon={Target}
                  title="1. Startup zadá výzvu"
                  text="Firma definuje reálný problém, zadání, odměnu a dovednosti, které u studenta hledá."
                />
              </ScrollAnimator>
              <ScrollAnimator delay={200}>
                <HowItWorksStep
                  icon={FileText}
                  title="2. Talenty odevzdají řešení"
                  text="Studenti se přihlásí, pracují na výzvě a odevzdají svá řešení, aby ukázali, co v nich je."
                />
              </ScrollAnimator>
              <ScrollAnimator delay={400}>
                <HowItWorksStep
                  icon={Award}
                  title="3. Vyhlášení vítězů"
                  text="Startup vybere nejlepší řešení, udělí odměny, poskytne cenný feedback a naváže kontakt s talenty."
                />
              </ScrollAnimator>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollAnimator>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl 3xl:text-5xl font-bold tracking-tight">Platforma, která funguje</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Podívej se, jak vypadá jádro naší aplikace v praxi.</p>
              </div>
            </ScrollAnimator>
            
            <ScrollAnimator delay={200}>
              <div className="w-full max-w-5xl mx-auto">
                <div className="bg-gray-100 rounded-t-xl p-3 flex items-center gap-1.5 border-2 border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                <div className="bg-white p-6 rounded-b-xl shadow-xs border-x border-2 border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-gray-200 mb-6">
                    <TabButton
                      title="Prohlížení výzev"
                      icon={LayoutGrid}
                      isActive={activeTab === 'challenges'}
                      onClick={() => setActiveTab('challenges')}
                    />
                    <TabButton
                      title="Hledání talentů"
                      icon={Users}
                      isActive={activeTab === 'talents'}
                      onClick={() => setActiveTab('talents')}
                    />
                    <TabButton
                      title="Růst kariéry"
                      icon={TrendingUp}
                      isActive={activeTab === 'growth'}
                      onClick={() => setActiveTab('growth')}
                    />
                  </div>
                  <div className="min-h-[400px]">
                    {activeTab === 'challenges' && (
                      <DemoChallengeView />
                    )}
                    {activeTab === 'talents' && (
                      <DemoTalentView />
                    )}
                    {activeTab === 'growth' && (
                      <DemoCareerGrowthWidget />
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimator>
          </div>
        </section>
        <section className="py-16 md:py-32 bg-[var(--barva-svetle-pozadi)]">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollAnimator>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl 3xl:text-5xl font-bold tracking-tight">Vytvořeno pro obě strany</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Každá role má u nás své jasné výhody.</p>
              </div>
            </ScrollAnimator>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <ScrollAnimator delay={0}>
                <ValuePropColumn
                  title="Pro TALENTY"
                  features={[
                    "Získej reálnou praxi (už žádné fiktivní úkoly)",
                    "Vybuduj si portfolio (každá výzva je reference)",
                    "Zvyšuj si level (náš unikátní XP systém tě motivuje)",
                    "Získej odměnu (finanční, stáž, nebo job offer)",
                    "Uč se od profíků (dostaneš profi feedback na každou práci)"
                  ]}
                />
              </ScrollAnimator>
              <ScrollAnimator delay={200}>
                <ValuePropColumn
                  title="Pro STARTUPY"
                  features={[
                    "Získej svěží nápady (na reálné business problémy)",
                    "Testuj talenty v praxi (než je najmeš na plno)",
                    "Šetři čas i náklady (efektivnější nábor)",
                    "Buduj brand (u mladé generace inovátorů)",
                    "Snadné hodnocení (anonymní, objektivní a rychlé)"
                  ]}
                />
              </ScrollAnimator>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-32 bg-white">
          <div className="w-5/6 3xl:w-4/5 mx-auto px-4 sm:px-6 space-y-4 lg:space-y-24">
            <ScrollAnimator>
              <div className="flex flex-col 2xl:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1 w-full 2xl:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex flex-col gap-2">Nejsi jen číslo. <span className='text-2xl md:text-3xl opacity-70'>S námi rosteš.</span> </h2>
                  <p className="md:text-lg text-gray-600 mb-8">Všechny tvé úspěchy a dovednosti vizualizujeme. Sleduj, jak se zlepšuješ v konkrétních dovednostech a buduj si portfolio, které mluví za tebe.</p>
                  <DemoStudentFeatures />
                </div>
              </div>
            </ScrollAnimator>
            <ScrollAnimator>
              <div className="flex flex-col 2xl:flex-row-reverse items-center md:gap-12">
                <div className="flex-1 w-full 2xl:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 mt-6 lg:mt-0">Rychlý nábor bez rizika.</h2>
                  <p className="md:text-lg text-gray-600 mb-8">Navrhli jsme proces, který ti šetří čas. Soustřeď se jen na kvalitu odevzdané práce. Anonymní hodnocení a snadný výběr vítězů.</p>
                  <DemoStartupFeatures />
                </div>
              </div>
            </ScrollAnimator>
          </div>
        </section>
        <section className="py-16 md:py-32 bg-[var(--barva-svetle-pozadi)]">
          <div className="container mx-auto text-center px-4 sm:px-6">
            <ScrollAnimator>
              <h2 className="text-3xl md:text-4xl 3xl:text-5xl font-bold tracking-tight text-[var(--barva-tmava)]">
                Připraven/a nastartovat budoucnost?
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Přidej se k rostoucí komunitě nejlepších studentů a inovativních firem v Česku. Registrace je zdarma.
              </p>
            </ScrollAnimator>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              <ScrollAnimator delay={0}>
                <FinalCtaCard
                  href="/register/student"
                  title="Jsem talent"
                  description="Chci na sobě makat, řešit výzvy a budovat si portfolio."
                  buttonText="Vytvořit studentský profil"
                  isPrimary={true}
                />
              </ScrollAnimator>
              <ScrollAnimator delay={200}>
                <FinalCtaCard
                  href="/register/startup"
                  title="Jsme firma"
                  description="Chceme najít nové talenty a získat inovativní řešení."
                  buttonText="Zadat první výzvu"
                  isPrimary={false}
                />
              </ScrollAnimator>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const TabButton = ({
  title,
  icon: Icon,
  isActive,
  onClick,
}: {
  title: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-semibold border-b-4 transition-all ${
        isActive
          ? 'border-[var(--barva-primarni)] text-[var(--barva-primarni)]'
          : 'border-transparent text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} />
      <span className='text-sm'>{title}</span>
    </button>
  );
};