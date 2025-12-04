"use client";

import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const ChoiceSection = ({ 
    href, 
    titleStart, 
    titleHighlight, 
    highlightBgClass, 
    description, 
    bgImage, 
    animationClass, 
    className 
}: { 
    href: string, 
    titleStart: string, 
    titleHighlight: string,
    highlightBgClass: string,
    description: string, 
    bgImage: string, 
    animationClass: string, 
    className?: string 
}) => (
    <Link href={href} className={`relative flex flex-col justify-center items-center text-white text-center p-4 overflow-hidden group ${className}`}>
        <div className={`absolute inset-0 z-0 ${animationClass}`}>
            <Image
                src={bgImage}
                alt={titleHighlight}
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                quality={90}
                priority
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                {titleStart}{' '}
                <span className={`relative inline-block px-4 py-1 ${highlightBgClass} -skew-x-6 transform transition-transform duration-300 group-hover:-skew-x-12`}>
                    <span className="inline-block skew-x-6">{titleHighlight}</span>
                </span>
            </h2>
            <p className="mt-2 text-xl md:text-2xl text-gray-100 max-w-md font-medium drop-shadow-md">{description}</p>
            
            <div className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-lg font-semibold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out hover:bg-white/20">
                <span>Pokračovat</span>
                <ArrowRight size={24} />
            </div>
        </div>
    </Link>
);

export default function RegisterChoiceView() {
    return (
        <div className="relative flex flex-col md:flex-row h-screen bg-[var(--barva-tmava)] overflow-hidden">
            <ChoiceSection 
                href="/register/student"
                titleStart="Jsem"
                titleHighlight="talent"
                highlightBgClass="bg-[var(--barva-primarni)]"
                description="Chci se zapojit do výzev a budovat kariéru."
                bgImage="/talent-bg.jpg" 
                animationClass="animate-slide-in-from-left"
                className="w-full md:w-1/2 h-1/2 md:h-full"
            />

            <ChoiceSection 
                href="/register/startup"
                titleStart="Jsme"
                titleHighlight="firma"
                highlightBgClass="bg-[var(--barva-tmava)]"
                description="Chci zadávat výzvy a najít nové talenty."
                bgImage="/company-bg.jpg" 
                animationClass="animate-slide-in-from-right"
                className="w-full md:w-1/2 h-1/2 md:h-full"
            />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
                <Link 
                    href="/register/professor"
                    className="group block relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex items-center justify-between p-4 pl-5">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 group-hover:text-emerald-200 transition-colors">
                                <GraduationCap size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-emerald-100 transition-colors">
                                    Jsem vyučující
                                </h3>
                                <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                                    Propojit výuku s praxí
                                </p>
                            </div>
                        </div>
                        
                        <div className="pr-2 text-gray-500 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-1">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}