"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
                layout="fill"
                objectFit="cover"
                quality={90}
                priority
                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300"></div>
        </div>

        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {titleStart}{' '}
                <span className={`inline-block px-3 py-1 ${highlightBgClass} -skew-x-6`}>
                    <span className="inline-block skew-x-6">{titleHighlight}</span>
                </span>
            </h2>
            <p className="mt-4 text-lg text-gray-200 max-w-xs">{description}</p>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 border-2 border-white rounded-full text-base font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>Zvolit tuto možnost</span>
                <ArrowRight size={20} />
            </div>
        </div>
    </Link>
);


export default function RegisterChoiceView() {
    return (
        <div className="flex flex-col md:flex-row h-screen bg-[var(--barva-tmava)]">
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
            {/* <ChoiceSection 
                href="/register/professor"
                titleStart="Jsem"
                titleHighlight="vyučující"
                highlightBgClass="bg-emerald-600"
                description="Chci propojit výuku s praxí."
                bgImage="/professor-bg.jpg" 
                animationClass="animate-fade-in-up"
                className="w-full md:w-1/3 h-1/3 md:h-full border-y md:border-y-0 md:border-x border-white/10"
            /> */}
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
        </div>
    );
}