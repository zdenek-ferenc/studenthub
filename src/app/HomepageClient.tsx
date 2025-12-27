  "use client";

  import { useState } from 'react';
  import Link from 'next/link';
  import Image from 'next/image';
  import { useAuth } from '../contexts/AuthContext';
  import {
    ArrowRight,
    Check,
    Target,
    Award,
    TrendingUp,
    LayoutGrid,
    Users,
    Zap,
    ShieldCheck,
    Rocket
  } from 'lucide-react';
  import ScrollAnimator from '../components/ScrollAnimator';

  import DemoChallengeView from '../components/homepage-demos/DemoChallengeView';
  import DemoTalentView from '../components/homepage-demos/DemoTalentView';
  import DemoCareerGrowthWidget from '../components/homepage-demos/DemoCareerGrowthWidget';
  import DemoStudentFeatures from '../components/homepage-demos/DemoStudentFeatures';
  import DemoStartupFeatures from '../components/homepage-demos/DemoStartupFeatures';


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

  type TabButtonProps = {
    title: string;
    icon: React.ComponentType<{size?: number}>;
    isActive: boolean;
    onClick: () => void;
  };
  const TabButton = ({ title, icon: Icon, isActive, onClick }: TabButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[var(--barva-primarni)] text-white shadow-sm ring-1 ring-gray-200'
          : 'text-[var(--barva-tmava)] cursor-pointer hover:text-gray-900 hover:inset-shadow-sm hover:bg-gray-100/50'
      }`}
    >
      <Icon size={16} />
      {title}
    </button>
  );


  export default function HomePage() {
    const [activeTab, setActiveTab] = useState('challenges');
    const { user, profile } = useAuth();

    const logos = [
      { src: '/unklogo.png', alt: 'Unknown Agency' },
      { src: '/vutlogo.png', alt: 'VUT' },
      { src: '/sporteralogo.png', alt: 'Sportera' },
      { src: '/contributelogo.png', alt: 'Contribute' },
      { src: '/renownlogo.png', alt: 'Renown Media' },
      { src: '/obzoremlogo.svg', alt: 'Studio Obzorem' },
      { src: '/vdlogo.svg', alt: 'Virtigo Digital' },
      { src: '/citroneklogo.png', alt: 'Citronek' }
    ];

    return (
      <div className="w-full overflow-x-hidden bg-[#001224] text-gray-900">
        
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
                Zahodili jsme nudné životopisy. Propojujeme <span className="text-white font-medium">ambiciózní studenty</span> a <span className="text-white font-medium">top startupy</span> skrze reálné výzvy.
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

            <div className="animate-soft-fade-up delay-600 mt-12 pb-24 sm:mt-24 w-full max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Důvěřují nám</p>
              </div>
              
              <div className="glass-panel rounded-3xl p-4 sm:p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#001224] via-transparent to-[#001224] z-10 pointer-events-none"></div>
                
                <div className="flex w-max animate-marquee items-center gap-12 sm:gap-20">
                  {[...logos, ...logos].map((logo, index) => (
                    <div key={index} className="opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={120}
                        height={40}
                        className="h-6 sm:h-8 w-auto object-contain hover:brightness-100 hover:contrast-100 transition-all" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-20 bg-white rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] -mt-10 overflow-hidden">
          
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

          <section className="py-20 bg-gray-50 border-y border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
              <ScrollAnimator>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl text-[var(--barva-tmava)] font-bold tracking-tight">Vše na jednom místě</h2>
                </div>
              </ScrollAnimator>

              <ScrollAnimator className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
                    <div className="bg-gray-100/80 backdrop-blur-md rounded-t-2xl md:rounded-t-3xl px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex gap-2 bg-white p-2 shadow-sm rounded-full">
                        <TabButton title="Výzvy" icon={LayoutGrid} isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} />
                        <TabButton title="Talenti" icon={Users} isActive={activeTab === 'talents'} onClick={() => setActiveTab('talents')} />
                        <TabButton title="Kariéra" icon={TrendingUp} isActive={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
                      </div>
                      <div className="w-16 hidden sm:block"></div> 
                    </div>

                    <div className="p-6 md:p-8 bg-white min-h-[500px]">
                      {activeTab === 'challenges' && (
                        <div className="animate-fade-in-up">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold">Přehled aktivních výzev</h3>
                              <span className="text-sm text-gray-400">Ukázka rozhraní</span>
                          </div>
                          <DemoChallengeView />
                          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                            💡 Studenti vidí výzvy filtrované podle jejich dovedností.
                          </div>
                        </div>
                      )}
                      {activeTab === 'talents' && (
                        <div className="animate-fade-in-up">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold">Databáze talentů</h3>
                              <span className="text-sm text-gray-400">Pohled startupu</span>
                          </div>
                          <DemoTalentView />
                          <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">
                            💡 Místo čtení CV vidíte reálné výsledky z výzev.
                          </div>
                        </div>
                      )}
                      {activeTab === 'growth' && (
                        <div className="animate-fade-in-up">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold">Růst a statistiky</h3>
                          </div>
                          <DemoCareerGrowthWidget />
                          <p className="mt-6 text-gray-600">Interaktivní grafy ukazují, jak se student zlepšuje v čase, kolik XP získal a jaké dovednosti ovládá.</p>
                        </div>
                      )}
                    </div>
                </div>
              </ScrollAnimator>
            </div>
          </section>

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
                  <div className="flex-1 w-full lg:w-auto bg-gray-50 rounded-3xl p-6 border border-gray-100">
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
                  <div className="flex-1 w-full lg:w-auto bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <DemoStartupFeatures />
                  </div>
                </div>
            </div>
          </section>

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

        </main>
      </div>
    );
  }