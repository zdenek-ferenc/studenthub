"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Users, TrendingUp, DollarSign } from 'lucide-react';
import ScrollAnimator from '../components/ScrollAnimator';
import StatsSection from '../components/StatsSection';

export default function HomePage() {
  return (
    <>
        <div className="w-full overflow-x-hidden text-[var(--barva-tmava)] !pt-0">
            <header className="relative h-screen min-h-[700px] flex items-center justify-center text-white bg-[var(--barva-tmava)] overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--barva-primarni)] via-[var(--barva-tmava)] to-black"></div>
                </div>
                <div className="container mx-auto text-center relative z-10 px-4 sm:px-6"> {/* Upraven padding */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-tight"> {/* Responzivní velikost textu */}
                        <div className="overflow-hidden">
                            <div className="animate-slide-in-reveal delay-100">
                                Praxe, co má smysl.
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[var(--barva-primarni)] animate-slide-in-reveal delay-200">
                                Talent, co mění hru.
                            </span>
                        </div>
                    </h1>
                    <div className="overflow-hidden mt-6">
                        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"> 
                            Propojujeme nejlepší studenty s inovativními startupy skrze reálné projekty. Přestaň snít o kariéře, začni ji budovat.
                        </p>
                    </div>
                    <div className="overflow-hidden mt-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 flex-wrap">
                            <Link href="/register/student" className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--barva-primarni)] text-lg text-white font-semibold shadow-lg hover:bg-[#0058aa] hover:shadow-none transition-all duration-300 flex justify-center items-center">
                                Chci výzvu
                            </Link>
                            <Link href="/register/startup" className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-[var(--barva-primarni)] text-lg text-white font-semibold shadow-lg hover:bg-[#00284d] hover:shadow-none transition-all duration-500 flex justify-center items-center">
                                Hledám talent
                            </Link>
                        </div>
                    </div>
                    <StatsSection/>
                </div>
            </header>

            <main>
                <section className="py-16 md:py-24 bg-[var(--barva-svetle-pozadi)]"> 
                    <div className="container mx-auto px-4 sm:px-6">
                        <ScrollAnimator>
                            <div className="text-center mb-12 md:mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Vše, co potřebuješ k nastartování kariéry. Nebo firmy.</h2>
                                <p className="mt-4 max-w-3xl mx-auto text-md sm:text-lg text-gray-600">Navrženo pro efektivitu, rychlost a reálné výsledky.</p>
                            </div>
                        </ScrollAnimator>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ScrollAnimator className="lg:col-span-2">
                                <div className="p-6 md:p-10 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl md:text-4xl font-bold mb-4">Reálné výzvy, reálné výsledky</h3>
                                        <p className="text-gray-600 text-base md:text-lg mb-6">Zapomeň na fiktivní úkoly. Pracuj na projektech, které mají skutečný dopad a řeší reálné problémy inovativních firem. Každá výzva je tvoje vstupenka do praxe.</p>
                                    </div>
                                    <div className="flex gap-4 sm:gap-6 items-center"> {/* Upraven gap */}
                                        <Image src="/unknown-agency-logo.svg" alt="Startup" width={60} height={60} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-2xl" />
                                        <Image src="/virtigodigital-logo.svg" alt="Startup" width={60} height={60} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-2xl" />
                                        <Image src="/VUT_CZ.svg" alt="Startup" width={60} height={60} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-2xl" />
                                        <p className='text-lg sm:text-xl font-semibold text-[var(--barva-tmava)]'>+42</p>
                                    </div>
                                </div>
                            </ScrollAnimator>
                            <ScrollAnimator delay={200}>
                                <div className="relative flex flex-col justify-center gap-2 p-6 md:p-8 bg-gradient-to-b from-[var(--barva-tmava)] to-[#002952] text-white rounded-3xl overflow-hidden h-full min-h-[250px]">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                                    <Users size={32} className="text-[var(--barva-primarni)] mb-4" />
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">Přístup k talentům</h3>
                                    <p className="text-gray-300">Procházejte profily nejlepších studentů, filtrujte podle dovedností a najděte perfektní match pro váš tým.</p>
                                </div>
                            </ScrollAnimator>
                            <ScrollAnimator>
                                <div className="p-6 md:p-8 flex flex-col justify-center gap-2 bg-white rounded-3xl shadow-xl border border-gray-100 h-full min-h-[250px]">
                                    <TrendingUp size={32} className="text-[var(--barva-primarni)] mb-4" />
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">Buduj si portfolio</h3>
                                    <p className="text-gray-600">Každá dokončená výzva se stává referencí ve tvém veřejném profilu.</p>
                                </div>
                            </ScrollAnimator>
                            <ScrollAnimator delay={200}>
                                <div className="p-6 md:p-8 flex flex-col justify-center gap-2 bg-white rounded-3xl shadow-xl border border-gray-100 h-full min-h-[250px]">
                                    <Check size={32} className="text-[var(--barva-primarni)] mb-4" />
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">Férová zpětná vazba</h3>
                                    <p className="text-gray-600">Každé tvoje řešení je okomentováno a ohodnoceno profíky z oboru.</p>
                                </div>
                            </ScrollAnimator>
                            <ScrollAnimator delay={400}>
                                <div className="p-6 md:p-8 flex flex-col justify-center gap-2 bg-white rounded-3xl shadow-xl border border-gray-100 h-full min-h-[250px]">
                                    <DollarSign size={32} className="text-[var(--barva-primarni)] mb-4" />
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">Získej odměnu</h3>
                                    <p className="text-gray-600">Za skvělou práci si zasloužíš finanční odměnu, stáž nebo nabídku práce.</p>
                                </div>
                            </ScrollAnimator>
                        </div>
                    </div>
                </section>
                
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <ScrollAnimator>
                            <div className="text-center mb-12 md:mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Jednoduchý proces, maximální dopad</h2>
                            </div>
                        </ScrollAnimator>
                        <div className="relative">
                            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-200"></div>
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                                <ScrollAnimator>
                                    <div className="text-center">
                                        <div className="relative inline-block px-4">
                                            <div className="w-16 h-16 mx-auto bg-[var(--barva-primarni)] text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">1</div>
                                        </div>
                                        <h3 className="mt-6 text-xl md:text-2xl font-bold">Startup zadá výzvu</h3>
                                        <p className="mt-2 text-gray-600">Definuje problém, zadání a odměnu.</p>
                                    </div>
                                </ScrollAnimator>
                                <ScrollAnimator delay={200}>
                                    <div className="text-center">
                                        <div className="relative inline-block px-4">
                                            <div className="w-16 h-16 mx-auto bg-[var(--barva-primarni)] text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">2</div>
                                        </div>
                                        <h3 className="mt-6 text-xl md:text-2xl font-bold">Studenti odevzdají řešení</h3>
                                        <p className="mt-2 text-gray-600">Ukážou své dovednosti na reálném projektu.</p>
                                    </div>
                                </ScrollAnimator>
                                <ScrollAnimator delay={400}>
                                    <div className="text-center">
                                        <div className="relative inline-block px-4">
                                            <div className="w-16 h-16 mx-auto bg-[var(--barva-primarni)] text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">3</div>
                                        </div>
                                        <h3 className="mt-6 text-xl md:text-2xl font-bold">Vyhlášení vítězů</h3>
                                        <p className="mt-2 text-gray-600">Startup vybere nejlepší řešení a naváže kontakt.</p>
                                    </div>
                                </ScrollAnimator>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-white py-16 md:py-24">
                    <div className="container mx-auto text-center px-4 sm:px-6">
                        <ScrollAnimator>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--barva-tmava)]">Připraven/a nastartovat budoucnost?</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-md sm:text-lg text-gray-600">
                                Přidej se k rostoucí komunitě nejlepších studentů a inovativních firem v Česku. Registrace je zdarma.
                            </p>
                            <div className="mt-8">
                                <Link href="/register/student" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--barva-primarni)] text-lg text-white font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 transform">
                                    Vytvořit účet <ArrowRight className="ml-2" size={20} />
                                </Link>
                            </div>
                        </ScrollAnimator>
                    </div>
                </section>
            </main>
        </div>
    </>
);
}