"use client";

import { Target, Rocket, Award } from 'lucide-react';
import ScrollAnimator from '../ScrollAnimator';

const ProcessCard = ({ icon: Icon, title, text, step }: { icon: React.ComponentType<{size?: number}>, title: string, text: string, step: string }) => (
  <div className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-50 text-6xl font-black font-sans text-blue-600 select-none transition-transform">
      {step}
    </div>
    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm md:text-base">{text}</p>
  </div>
);

export default function ProcessSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <ScrollAnimator>
          <div className="text-center mb-16 space-y-4 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2">Jednoduchý proces,</h2>
            <h2 className="text-[var(--barva-primarni)] text-3xl md:text-5xl font-bold tracking-tight">maximální dopad.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Žádná byrokracie. Jen přímá cesta k výsledkům pro obě strany.</p>
          </div>
        </ScrollAnimator>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <ScrollAnimator delay={0}>
            <ProcessCard 
              step="1"
              icon={Target}
              title="Startup zadá výzvu"
              text="Firma definuje reálný problém, odměnu a skills. Žádné fiktivní úkoly do šuplíku."
            />
          </ScrollAnimator>
          <ScrollAnimator delay={150}>
            <ProcessCard 
              step="2"
              icon={Rocket}
              title="Realizace řešení"
              text="Talenti pracují na zadání. Startup získává čerstvé nápady, studenti cennou praxi."
            />
          </ScrollAnimator>
          <ScrollAnimator delay={300}>
            <ProcessCard 
              step="3"
              icon={Award}
              title="Výběr & Spolupráce"
              text="Vítěz bere odměnu. Ale hlavní výhrou je propojení – často končí stáží nebo jobem."
            />
          </ScrollAnimator>
        </div>
      </div>
    </section>
  );
}