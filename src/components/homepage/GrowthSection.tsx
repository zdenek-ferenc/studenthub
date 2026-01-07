    "use client";

    import { Zap, ShieldCheck, Check } from 'lucide-react';
    import DemoStudentFeatures from '../homepage-demos/DemoStudentFeatures';
    import DemoStartupFeatures from '../homepage-demos/DemoStartupFeatures';

    export default function GrowthSection() {
    return (
        <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-32">
            
            <div className="flex flex-col items-center gap-12 lg:gap-20">
                <div className="flex-1 space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Zap size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">Nejsi jen číslo.<br/><span className='text-[var(--barva-primarni)]'>S námi rosteš.</span></h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                    Všechny tvé úspěchy a dovednosti vizualizujeme. Sleduj, jak se zlepšuješ v konkrétních dovednostech a buduj si portfolio, které mluví za tebe.
                    </p>
                    <ul className="space-y-3 pt-4">
                    <li className="flex items-center gap-2 text-gray-700 font-medium"><Check className="text-[var(--barva-primarni)]"/> Automaticky generované CV</li>
                    <li className="flex items-center gap-2 text-gray-700 font-medium"><Check className="text-[var(--barva-primarni)]"/> Ověřené dovednosti</li>
                    </ul>
                </div>
                <div className="flex-1 w-full lg:w-auto bg-gray-50 rounded-3xl p-2 md:p-6 border border-gray-100">
                    <DemoStudentFeatures />
                </div>
            </div>

            <div className="flex flex-col items-center gap-12 lg:gap-20">
                <div className="flex-1 space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">Nábor bez rizika.<br/><span className='text-[var(--barva-primarni)]'>Vidíš výsledky.</span></h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                    Navrhli jsme proces, který ti šetří čas. Soustřeď se jen na kvalitu odevzdané práce. Anonymní hodnocení a snadný výběr vítězů.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--barva-primarni)]">3x</div>
                        <div className="text-sm text-gray-500">Rychlejší hire</div>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                        <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--barva-primarni)]">100%</div>
                        <div className="text-sm text-gray-500">Ověření skills</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full lg:w-auto bg-gray-50 rounded-3xl p-2 md:p-6 border border-gray-100">
                    <DemoStartupFeatures />
                </div>
            </div>
        </div>
        </section>
    );
    }