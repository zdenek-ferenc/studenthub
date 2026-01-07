    "use client";

    import Link from 'next/link';
    import Image from 'next/image';
    import { ArrowRight } from 'lucide-react';
    import { useAuth } from '../../contexts/AuthContext';

    import unklogo from '../../../public/unklogo.png';
    import vutlogo from '../../../public/vutlogo.png';
    import sporteralogo from '../../../public/sporteralogo.png';
    import contributelogo from '../../../public/contributelogo.png';
    import renownlogo from '../../../public/renownlogo.png';
    import obzoremlogo from '../../../public/obzoremlogo.svg';
    import vdlogo from '../../../public/vdlogo.svg';
    import citroneklogo from '../../../public/citroneklogo.png';

    const logos = [
    { src: unklogo, alt: 'Unknown Agency' },
    { src: vutlogo, alt: 'VUT' },
    { src: sporteralogo, alt: 'Sportera' },
    { src: contributelogo, alt: 'Contribute' },
    { src: renownlogo, alt: 'Renown Media' },
    { src: obzoremlogo, alt: 'Studio Obzorem' },
    { src: vdlogo, alt: 'Virtigo Digital' },
    { src: citroneklogo, alt: 'Citronek' }
    ];

    export default function HeroSection() {
    const { user, profile } = useAuth();

    return (
        <header className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#001224]"></div>
            
            <div className="absolute inset-0 bg-grid-white opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"></div>
            
            <div className="aurora-blob w-[500px] h-[500px] bg-blue-600/30 top-[-10%] left-[-10%] blur-[120px]"></div>
            <div className="aurora-blob w-[400px] h-[400px] bg-cyan-500/20 bottom-[10%] right-[-5%] blur-[100px] delay-1000"></div>
            <div className="aurora-blob w-[600px] h-[300px] bg-indigo-600/20 top-[40%] left-[30%] blur-[120px] delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-20">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-white pt-16 mb-6 leading-[1.1] flex flex-col items-center gap-1">
                <span className="animate-soft-fade-up delay-100">Praxe, co dává</span>
                <span className="animate-soft-fade-up delay-200 text-glow-gradient relative">
                smysl.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                </span>
            </h1>

            <p className="animate-soft-fade-up delay-300 mt-6 max-w-2xl text-lg sm:text-xl text-gray-400 font-light leading-relaxed">
                Zahodili jsme nudné životopisy. Propojujeme <span className="text-white font-medium">ambiciózní studenty</span> a <span className="text-white font-medium">startupy</span> skrze reálné výzvy.
            </p>

            <div className="animate-soft-fade-up delay-400 mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {!user ? (
                <>
                    <Link
                    href="/register/student"
                    className="btn-shiny group relative px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                    Chci výzvu
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                    href="/register/startup"
                    className="group px-8 py-4 glass-panel text-white rounded-full font-medium text-lg hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center"
                    >
                    Hledám talent
                    </Link>
                </>
                ) : (
                <Link
                    href={profile?.role === 'student' ? '/dashboard' : '/challenges'}
                    className="btn-shiny !rounded-full sm:px-10 py-3 sm:py-4 bg-[var(--barva-primarni)] text-white rounded-xl font-semibold sm:text-lg shadow-lg hover:-translate-y-0.5 transition-all ease-in-out duration-200"
                >
                    Vstoupit do aplikace
                </Link>
                )}
            </div>
            </div>

            <div className="animate-soft-fade-up delay-100 mt-12 pb-24 sm:mt-24 w-full max-w-6xl mx-auto">
            <div className="text-center mb-6">
                <p className="text-sm text-gray-300 uppercase tracking-widest font-semibold">Důvěřují nám</p>
            </div>
            
            <div className="glass-panel !border-none rounded-3xl p-4 sm:p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#001224] via-transparent to-[#001224] z-10 pointer-events-none"></div>
                
                <div className="flex w-max animate-marquee items-center gap-12 sm:gap-20">
                {[...logos, ...logos].map((logo, index) => (
                    <div key={index} className="opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
                    <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={120}
                        height={40}
                        priority={index < 8}
                        quality={85}
                        className="h-6 sm:h-8 w-auto object-contain hover:brightness-100 hover:contrast-100 transition-all"
                    />
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        </header>
    );
    }