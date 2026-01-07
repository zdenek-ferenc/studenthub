    "use client";

    import Link from 'next/link';
    import { ArrowRight } from 'lucide-react';
    import ScrollAnimator from '../ScrollAnimator';

    export default function CTASection() {
    return (
        <section className="py-20 md:py-32 bg-[#001224] text-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <ScrollAnimator>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Jdeš do toho?</h2>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Přidej se k komunitě, která mění pravidla hry. Registrace je zdarma a zabere 2 minuty.</p>
            </ScrollAnimator>
            
            <ScrollAnimator delay={200}>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all cursor-pointer text-left w-full sm:w-80">
                        <h3 className="text-2xl font-bold mb-2">Jsem Student</h3>
                        <p className="text-gray-400 mb-6 text-sm">Chci makat na reálných projektech.</p>
                        <Link href="/register/student" className="inline-flex items-center gap-2 text-blue-400 font-bold group-hover:gap-3 transition-all">
                        Vytvořit profil <ArrowRight size={18}/>
                        </Link>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer text-left w-full sm:w-80 border border-blue-400/30">
                        <h3 className="text-2xl font-bold mb-2 text-white">Jsme Startup</h3>
                        <p className="text-blue-100 mb-6 text-sm">Hledáme neotřelé nápady a lidi.</p>
                        <Link href="/register/startup" className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all">
                        Zadat první výzvu <ArrowRight size={18}/>
                        </Link>
                    </div>
                </div>
            </ScrollAnimator>
        </div>
        </section>
    );
    }