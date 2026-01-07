    "use client";

    import Link from 'next/link';
    import { ArrowRight, Check } from 'lucide-react';
    import ScrollAnimator from '../ScrollAnimator';

    const BenefitCard = ({ title, features, type }: { title: string, features: string[], type: 'student' | 'startup' }) => {
    const isStudent = type === 'student';
    return (
        <div className={`relative p-8 md:p-10 rounded-[2.5rem] overflow-hidden border transition-all duration-300 group h-full ${
        isStudent ? 'bg-white border-gray-100 hover:border-blue-100 shadow-sm' : 'bg-slate-900 text-white border-slate-800 shadow-2xl'
        }`}>
        {isStudent ? (
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
        ) : (
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-900/20 to-transparent rounded-tr-full opacity-50"></div>
        )}

        <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
            isStudent ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
            }`}>
            {isStudent ? 'Pro Talenty' : 'Pro Startupy'}
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">{title}</h3>
            
            <ul className="space-y-4">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 group/item">
                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isStudent ? 'bg-green-100 text-green-600' : 'bg-green-500/20 text-green-400'
                }`}>
                    <Check size={12} strokeWidth={3} />
                </div>
                <span className={`text-base md:text-lg ${isStudent ? 'text-gray-600' : 'text-gray-300 group-hover/item:text-white transition-colors'}`}>
                    {feature}
                </span>
                </li>
            ))}
            </ul>

            <div className="mt-10 pt-6 border-t border-dashed border-gray-200/20">
            <Link 
                href={isStudent ? "/register/student" : "/register/startup"}
                className={`flex items-center gap-2 font-semibold hover:gap-3 transition-all ${
                isStudent ? 'text-blue-600' : 'text-blue-300'
                }`}
            >
                {isStudent ? 'Vytvořit profil' : 'Zadat výzvu'} <ArrowRight size={18} />
            </Link>
            </div>
        </div>
        </div>
    );
    };

    export default function WinWinSection() {
    return (
        <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <ScrollAnimator>
            <h2 className="text-center text-[var(--barva-tmava)] text-3xl md:text-5xl font-bold mb-16 tracking-tight">Win-Win řešení</h2>
            </ScrollAnimator>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-stretch">
            <ScrollAnimator className="h-full">
                <BenefitCard 
                    title="Jsem Student" 
                    type="student"
                    features={[
                    "Reálná praxe do portfolia",
                    "Finanční odměny za úspěchy",
                    "Feedback od profesionálů",
                    "Přímý kontakt na firmy",
                    "Gamifikace (XP a Levely)"
                    ]}
                />
            </ScrollAnimator>
            <ScrollAnimator delay={200} className="h-full">
                <BenefitCard 
                    title="Jsme Startup" 
                    type="startup"
                    features={[
                    "Outsource kreativních úkolů",
                    "Ověření skills před náborem",
                    "Přístup k top talentům VUT",
                    "Branding u Gen Z",
                    "Úspora času při hiringu"
                    ]}
                />
            </ScrollAnimator>
            </div>
        </div>
        </section>
    );
    }