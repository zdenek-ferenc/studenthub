"use client";

import { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { 
    Palette, Megaphone, Box, ExternalLink, 
    Layout, Image as ImageIcon, Globe, 
    Video, FileText, Search, 
    ChevronDown, Briefcase, 
    GraduationCap, Zap, Layers,
    DollarSign, Send, UserCheck, Coffee,
    Library
} from 'lucide-react';
import Link from 'next/link';


type ResourceItem = {
    name: string;
    desc: string;
    url: string;
    icon: React.ElementType; 
    color: string;
    tags?: string[];
};

const SKILL_RESOURCES: Record<string, ResourceItem[]> = {
    'photoshop': [
        { name: 'Piximperfect', desc: 'Youtube tutoriály, co tě naučí vše', url: 'https://www.youtube.com/@PiXimperfect', icon: Video, color: 'text-blue-400' },
        { name: 'TextureLabs', desc: 'Free textury pro profi look', url: 'https://texturelabs.org/', icon: ImageIcon, color: 'text-gray-400' },
        { name: 'Photopea', desc: 'Photoshop zdarma v prohlížeči', url: 'https://www.photopea.com/', icon: Layers, color: 'text-green-400' },
    ],
    'figma': [
        { name: 'Figma Community', desc: 'Nekresli to znova, stáhni to', url: 'https://www.figma.com/community', icon: Layout, color: 'text-purple-400' },
        { name: 'Relume', desc: 'Knihovna hotových webových sekcí', url: 'https://library.relume.io/', icon: Box, color: 'text-white' },
        { name: 'Figma Shortcuts', desc: 'Dělej 2x rychleji', url: 'https://shortcuts.design/tool/figma/', icon: Zap, color: 'text-yellow-400' },
    ],
    'canva': [
        { name: 'Canva Design School', desc: 'Aby to nevypadalo levně', url: 'https://www.canva.com/designschool/', icon: GraduationCap, color: 'text-cyan-400' },
        { name: 'Coolors', desc: 'Barvy, co k sobě ladí', url: 'https://coolors.co', icon: Palette, color: 'text-blue-500' },
        { name: 'Remove.bg', desc: 'Ořez pozadí na jeden klik', url: 'https://www.remove.bg/', icon: ImageIcon, color: 'text-gray-300' },
    ],
    'branding': [
        { name: 'Logo Lab', desc: 'Otestuj, jestli tvé logo funguje', url: 'https://logolab.app', icon: Box, color: 'text-orange-400' },
        { name: 'Mockup World', desc: 'Dej logo na tričko/mobil (free)', url: 'https://www.mockupworld.co/', icon: ImageIcon, color: 'text-blue-400' },
    ],
    'marketing': [
        { name: 'Facebook Ad Library', desc: 'Špionáž reklam konkurence', url: 'https://www.facebook.com/ads/library', icon: Search, color: 'text-blue-600' },
        { name: 'Really Good Emails', desc: 'Inspirace pro newslettery', url: 'https://reallygoodemails.com/', icon: Send, color: 'text-red-400' },
    ],
    'copywriting': [
        { name: 'Hemingway App', desc: 'Aby se to dalo číst', url: 'https://hemingwayapp.com', icon: Type, color: 'text-red-500' },
        { name: 'Wordtune', desc: 'Přepiš to lépe (AI)', url: 'https://www.wordtune.com/', icon: FileText, color: 'text-purple-400' },
    ],
    'backend': [
        { name: 'Roadmap.sh', desc: 'Co se sakra učit dál', url: 'https://roadmap.sh/backend', icon: Globe, color: 'text-yellow-400' },
        { name: 'Supabase', desc: 'Backend za 5 minut', url: 'https://supabase.com/', icon: Database, color: 'text-emerald-400' },
    ]
};

const CAREER_HACKS_RESOURCES: ResourceItem[] = [
    { 
        name: 'Harvard CV Templates', 
        desc: 'Vzory životopisů, co ti reálně seženou pohovor', 
        url: 'https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/', 
        icon: FileText, 
        color: 'text-red-500' 
    },
    { 
        name: 'Interview Warmup (Google)', 
        desc: 'AI simulátor pohovoru. Trénuj, ať nekoktáš.', 
        url: 'https://grow.google/certificates/interview-warmup/', 
        icon: UserCheck, 
        color: 'text-blue-400' 
    },
    { 
        name: 'Cold Email Guide', 
        desc: 'Jak napsat do firmy a dostat odpověď (šablony)', 
        url: 'https://hbr.org/2016/09/a-guide-to-cold-emailing', 
        icon: Send, 
        color: 'text-yellow-400' 
    },
    { 
        name: 'Salary Negotiation', 
        desc: 'Nenech se odrbat o peníze hned na startu', 
        url: 'https://www.kalzumeus.com/2012/01/23/salary-negotiation/', 
        icon: DollarSign, 
        color: 'text-emerald-400' 
    },
    { 
        name: 'Deep Work (Summary)', 
        desc: 'Jak se učit 2x rychleji než ostatní', 
        url: 'https://todoist.com/inspiration/deep-work', 
        icon: Coffee, 
        color: 'text-orange-400' 
    },
];

import { Type, Database } from 'lucide-react';

export default function ModernResourceBoxWidget() {
    const { submissions, progress } = useDashboard(); 
    const [activeTab, setActiveTab] = useState<'hacks' | 'skills' | 'challenge'>('hacks');
    
    const activeSubmissions = useMemo(() => {
        if (!submissions) return [];
        return submissions.filter(s => {
            if (['rejected', 'archived', 'closed'].includes(s.status)) return false;
            if (s.Challenge?.deadline) {
                const deadline = new Date(s.Challenge.deadline);
                const now = new Date();
                if (deadline < now && s.status !== 'submitted') return false; 
            }
            return true;
        });
    }, [submissions]);

    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (activeSubmissions.length > 0 && !selectedSubmissionId) {
            setSelectedSubmissionId(activeSubmissions[0].id);
        }
    }, [activeSubmissions, selectedSubmissionId]);

    const selectedSubmission = activeSubmissions.find(s => s.id === selectedSubmissionId);

    const challengeResources = useMemo(() => {
        if (!selectedSubmission || !selectedSubmission.Challenge) return [];
        const challenge = selectedSubmission.Challenge;
        const title = challenge.title.toLowerCase();
        
        let foundResources: ResourceItem[] = [];
        
        type ChallengeSkillType = { Skill?: { name?: string } | null };
        const keywords = [
            ...title.split(' '),
            ...(challenge.ChallengeSkill?.map((cs: ChallengeSkillType) => cs.Skill?.name?.toLowerCase() || "") || [])
        ];

        Object.keys(SKILL_RESOURCES).forEach(key => {
            if (keywords.some(k => k.includes(key) || key.includes(k))) {
                foundResources = [...foundResources, ...SKILL_RESOURCES[key]];
            }
        });

        if (title.includes('logo') || title.includes('brand')) {
            foundResources.push({ name: 'Logo Lab', desc: 'Test loga', url: 'https://logolab.app', icon: Box, color: 'text-orange-400' });
        }
        if (title.includes('prezent') || title.includes('pitch')) {
            foundResources.push({ name: 'Pitch Deck Examples', desc: 'Vzory prezentací', url: 'https://bestpitchdeck.com/', icon: Megaphone, color: 'text-purple-400' });
        }

        const uniqueResources = new Map();
        foundResources.forEach(item => {
            if (!uniqueResources.has(item.url)) {
                uniqueResources.set(item.url, item);
            }
        });

        return Array.from(uniqueResources.values()).slice(0, 5);
    }, [selectedSubmission]);

    const mySkillResources = useMemo(() => {
        if (!progress || !progress.StudentSkill) return [];
        
        let resources: ResourceItem[] = [];
        const sortedSkills = [...progress.StudentSkill].sort((a, b) => b.level - a.level);

        sortedSkills.forEach(ss => {
            const skillName = ss.Skill?.name.toLowerCase();
            if (skillName && SKILL_RESOURCES[skillName]) {
                resources = [...resources, ...SKILL_RESOURCES[skillName]];
            }
            else if (skillName) {
                const key = Object.keys(SKILL_RESOURCES).find(k => skillName.includes(k));
                if (key) resources = [...resources, ...SKILL_RESOURCES[key]];
            }
        });

        const uniqueResources = new Map();
        resources.forEach(item => {
            if (!uniqueResources.has(item.url)) {
                uniqueResources.set(item.url, item);
            }
        });

        return Array.from(uniqueResources.values()).slice(0, 5);
    }, [progress]);


    return (
        <div className="bg-gradient-to-br from-[#0B1623]/90 to-[#121e2e]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-5 h-full flex flex-col relative overflow-visible group">
            
            <div className="flex items-center gap-3 mb-5 px-1">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Library size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-base text-white leading-none mb-1">Zdroje</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Výběr nástrojů a know-how.</p>
                </div>
            </div>

            <div className="flex p-1 bg-[#001224] border border-white/5 rounded-xl mb-4">
                <button 
                    onClick={() => setActiveTab('hacks')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'hacks' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Zap size={14} className={activeTab === 'hacks' ? 'text-yellow-400' : ''} /> Kariéra
                </button>
                <button 
                    onClick={() => setActiveTab('skills')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'skills' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Layers size={14} className={activeTab === 'skills' ? 'text-blue-400' : ''}/> Skills
                </button>
                <button 
                    onClick={() => setActiveTab('challenge')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'challenge' ? 'bg-blue-600/20 text-blue-300 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Briefcase size={14} /> Výzvy
                </button>
            </div>

            <div className="flex-1 space-y-2 relative z-10 min-h-[200px]">
                
                {activeTab === 'hacks' && (
                    <div className="animate-fade-in-up space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 ml-1">Must-have pro úspěch</p>
                        {CAREER_HACKS_RESOURCES.map((item, idx) => (
                            <ResourceLink key={idx} item={item} />
                        ))}
                    </div>
                )}
                
                {activeTab === 'skills' && (
                    <div className="animate-fade-in-up space-y-2">
                        {mySkillResources.length > 0 ? (
                            <>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 ml-1">Tooly pro tvůj profil</p>
                                {mySkillResources.map((item, idx) => (
                                    <ResourceLink key={idx} item={item} />
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-8 opacity-60 flex flex-col items-center">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                    <Search size={20}/>
                                </div>
                                <p className="text-xs text-gray-400">Zatím nevíme, co umíš.</p>
                                <p className="text-[10px] text-gray-500 mb-2">Doplň si skills (jako Canva, Figma, Marketing) a my ti ukážeme top nástroje.</p>
                                <Link href="/profile/edit" className="text-xs text-blue-400 hover:text-blue-300 font-bold border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                                    Doplnit skills
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'challenge' && (
                    <div className="animate-fade-in-up space-y-2">
                        {activeSubmissions.length > 0 ? (
                            <div className="relative mb-3">
                                <button 
                                    onClick={() => activeSubmissions.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full flex items-center justify-between gap-2 text-xs font-bold text-white bg-white/5 px-3 py-2 rounded-xl border border-white/5 ${activeSubmissions.length > 1 ? 'cursor-pointer hover:bg-white/10' : ''}`}
                                >
                                    <span className="truncate flex-1 text-left">
                                        {selectedSubmission?.Challenge?.title}
                                    </span>
                                    {activeSubmissions.length > 1 && <ChevronDown size={14}/>}
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-[#0F1C2E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {activeSubmissions.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => { setSelectedSubmissionId(sub.id); setIsDropdownOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 truncate"
                                            >
                                                {sub.Challenge?.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
                            </div>
                        ) : (
                            <div className="text-center py-8 opacity-100 flex flex-col items-center">
                                <div className="w-12 h-12 opacity-60 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                    <Briefcase size={20}/>
                                </div>
                                <p className="text-xs text-gray-400 opacity-60 font-bold mb-1">Žádná aktivní výzva</p>
                                <p className="text-[10px] opacity-60 text-gray-500 mb-3">Tady se objeví nástroje, až se do něčeho pustíš.</p>
                                
                                <Link 
                                    href="/challenges" 
                                    className="text-xs text-white font-bold border border-blue-500/30 px-4 py-2 rounded-lg bg-[var(--barva-primarni)] btn-shiny transition-colors"
                                >
                                    Najít výzvu
                                </Link>
                            </div>
                        )}

                        {challengeResources.length > 0 ? (
                            challengeResources.map((item, idx) => (
                                <ResourceLink key={idx} item={item} />
                            ))
                        ) : selectedSubmission ? (
                            <div className="text-center py-4 text-xs text-gray-500 italic px-4">
                                Pro tuto kombinaci skillů zatím nemáme specifické tipy. Zkus záložku <span className="text-yellow-400">Kariéra</span>.
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

const ResourceLink = ({ item }: { item: ResourceItem }) => (
    <a 
        href={item.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all ease-in-out duration-200 group/item"
    >
        <div className={`p-2 rounded-lg bg-[#0B1623] ${item.color} shadow-sm border border-white/5 shrink-0`}>
            <item.icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-200 group-hover/item:text-blue-300 transition-colors">{item.name}</h4>
            <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
        </div>
        <ExternalLink size={12} className="text-gray-600 group-hover/item:text-white transition-colors opacity-0 group-hover/item:opacity-100 shrink-0" />
    </a>
);