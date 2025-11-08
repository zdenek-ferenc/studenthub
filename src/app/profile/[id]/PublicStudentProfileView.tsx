"use client";

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth, Profile } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SkillRadarChart from './components/SkillRadarChart';
import ProfilePortfolioSection from './components/ProfilePortfolioSection';
import ProfileSkillsSection from './components/ProfileSkillsSection';
import { 
    Github, 
    Linkedin, 
    Dribbble, 
    Link as LinkIcon, 
    Briefcase, 
    GraduationCap, 
    Edit, 
    PlusCircle,
    ChevronLeft,
    Settings, 
    CheckCircle, 
    XCircle,
    Handshake, 
    Loader2, 
    MessageSquare, 
    Info 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContactStudentModal from '../../../components/ContactStudentModal';

type Skill = {
    name: string;
};

type Language = {
    name: string;
};

type ChallengeSkill = {
    Skill: Skill;
};

type StartupProfileInfo = {
    company_name: string;
    logo_url: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ChallengeInfo = {
    id: string;
    title: string;
    startup_id: string;
    ChallengeSkill: ChallengeSkill[];
    StartupProfile: StartupProfileInfo | null;
};

type Submission = {
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
        startup_id: string; 
        ChallengeSkill: { Skill: { name: string } }[];
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
    } | null;
};

type StudentSkill = {
    level: number;
    xp: number;
    Skill: Skill;
};

type StudentLanguage = {
    Language: Language;
};

type StudentProfile = {
    user_id: string; 
    first_name: string; 
    last_name: string; 
    username: string; 
    bio: string | null; 
    profile_picture_url: string | null;
    university: string | null; 
    field_of_study: string | null; 
    level: number; 
    xp: number;
    github_url: string | null; 
    linkedin_url: string | null;
    dribbble_url: string | null; 
    personal_website_url: string | null;
    StudentSkill: StudentSkill[];
    StudentLanguage: StudentLanguage[];
    Submission: Submission[];
    recruitment_status: 'open_to_work' | 'not_looking' | null; 
};

const SocialLink = ({ href, Icon, label }: { href: string | null, Icon: React.ElementType, label: string }) => {
    if (!href) return null;
    const validHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
    return (
        <a href={validHref} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
            <Icon size={24} />
        </a>
    );
};

const RecruitmentStatusTag = ({ status, isOwner, viewerRole }: { status: StudentProfile['recruitment_status'], isOwner: boolean, viewerRole: 'student' | 'startup' | 'admin' | null }) => {
    if (status === 'open_to_work') {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm font-semibold border border-green-200">
                <CheckCircle size={14} />
                Otevřený nabídkám
            </div>
        );
    }

    if (status === 'not_looking' && (isOwner || viewerRole === 'startup' || viewerRole === 'admin')) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold border border-gray-200">
                <XCircle size={14} />
                Momentálně nehledá
            </div>
        );
    }
    
    if (status === null && isOwner) {
        return (
            <Link href="/profile/edit?tab=personal" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border border-gray-200 hover:border-gray-400 transition-colors">
                <PlusCircle size={14} />
                Nastavit pracovní status
            </Link>
        );
    }
    return null;
}

const ProfileInfoCard = ({ profile, isOwner, viewerProfile }: { profile: StudentProfile, isOwner: boolean, viewerProfile: Profile | null }) => {
    const { user, showToast } = useAuth(); 
    const startupCompanyName = (viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') 
                                    ? viewerProfile.company_name 
                                    : 'Startup';
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState(profile?.bio || '');
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactState, setContactState] = useState<{
        loading: boolean;
        can_contact: boolean;
        reason: string | null;
        status: string | null;
        challenge_id: string | null;
    }>({
        loading: (viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner,
        can_contact: false,
        reason: null,
        status: null,
        challenge_id: null,
    });

    useEffect(() => {
        if ((viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner && user) {
            setContactState(prev => ({ ...prev, loading: true }));
            
            const checkEligibility = async () => {
                const { data, error } = await supabase.rpc('check_contact_eligibility', {
                    p_startup_id: user.id,
                    p_student_id: profile.user_id 
                });

                if (error) {
                    console.error("Chyba při kontrole oprávnění:", error);
                    setContactState({ loading: false, can_contact: false, reason: 'rpc_error', status: null, challenge_id: null });
                } else {
                    setContactState({ loading: false, ...data });
                }
            };
            checkEligibility();
        } else {
            setContactState(prev => ({ ...prev, loading: false }));
        }
    }, [isOwner, user, profile.user_id, viewerProfile?.role]);


    const handleSaveBio = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from('StudentProfile').update({ bio: bioText }).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            setIsEditing(false);
            showToast('Bio bylo úspěšně uloženo!', 'success');
        }
        setSaving(false);
    };

    const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
    const hasAnyLink = !!(profile.linkedin_url || profile.github_url || profile.dribbble_url || profile.personal_website_url);

    const renderContactButton = () => {
        if (contactState.loading) {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-500 cursor-wait">
                    <Loader2 className="animate-spin" size={18} />
                    Načítám...
                </button>
            );
        }

        if (contactState.status === 'pending') {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500">
                    <MessageSquare size={18} />
                    Žádost odeslána
                </button>
            );
        }

        if (contactState.status === 'accepted') {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700">
                    <CheckCircle size={18} />
                    Kontakt navázán
                </button>
            );
        }

        if (contactState.can_contact) {
            return (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex mx-auto items-center cursor-pointer justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--barva-primarni)] text-white text-sm font-semibold hover:opacity-90 transition-opacity ease-in-out duration-200"
                >
                    <Handshake size={18} />
                    Kontaktovat talent
                </button>
            );
        }

        if (contactState.reason === 'not_looking') {
            return (
                <button disabled title="Student si nepřeje být kontaktován" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 cursor-not-allowed">
                    <Info size={18} />
                    Student momentálně nepříjmá kontakty
                </button>
            );
        }

        return null;
    };

    return (
        <> 
            <div className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
                {isOwner && (
                    <Link
                        href="/profile/edit"
                        title="Upravit profil"
                        className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:bg-[var(--barva-primarni2)] hover:text-[var(--barva-primarni)] transition-colors z-10"
                    >
                        <Settings size={16} />
                    </Link>
                )}

                <div className="text-center">
                    <div className="h-16 w-16 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 relative">
                        {profile.profile_picture_url ? (
                            <Image
                            src={profile.profile_picture_url}
                            alt={`Profilový obrázek ${profile.first_name} ${profile.last_name}`}
                            width={200}
                            height={200}
                            className="h-16 w-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
                            key={profile.profile_picture_url}
                            />
                        ) : (
                            <div className="h-16 w-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[var(--barva-primarni2)] to-[var(--barva-primarni2)]/70 text-[var(--barva-primarni)] flex items-center justify-center text-xl sm:text-4xl font-bold">
                            {initials}
                            </div>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--barva-tmava)]">{profile.first_name} {profile.last_name}</h1>
                    <p className="text-gray-500 text-sm sm:text-base">@{profile.username}</p>
                    
                    <div className="mt-3 h-8">
                        <RecruitmentStatusTag status={profile.recruitment_status} isOwner={isOwner} viewerRole={viewerProfile?.role || null} />
                    </div>
                    <div className="mt-4 max-w-xs mx-auto">
                        {(viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner && renderContactButton()}
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-4 sm:mt-4">
                        <SocialLink href={profile.linkedin_url} Icon={Linkedin} label="LinkedIn" />
                        <SocialLink href={profile.github_url} Icon={Github} label="GitHub" />
                        <SocialLink href={profile.dribbble_url} Icon={Dribbble} label="Dribbble" />
                        <SocialLink href={profile.personal_website_url} Icon={LinkIcon} label="Osobní web" />
                        {isOwner && (
                            <Link
                                href="/profile/edit?tab=links"
                                title="Upravit odkazy"
                                className="flex items-center gap-1 text-gray-400 hover:text-[var(--barva-primarni)] transition-colors"
                            >
                                <PlusCircle size={20} />
                                {!hasAnyLink && <span className="text-xs">(Přidat odkazy)</span>}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="text-sm space-y-4 mt-2 sm:mt-6 pt-4 border-t border-gray-100">
                    <div className="text-gray-700">
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    placeholder="Řekni něco o sobě, co tě zajímá, na čem pracuješ..."
                                    className="w-full min-h-[100px] text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50 p-2 focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
                                />
                                <div className="flex items-center gap-2">
                                    <button onClick={handleSaveBio} disabled={saving} className="text-sm font-semibold text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                                    <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500">Zrušit</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={`text-xs sm:text-sm whitespace-pre-wrap ${!bioText ? 'text-gray-500' : ''}`}>
                                    {bioText
                                        ? bioText 
                                        : isOwner
                                            ? "Přidej krátký popisek o sobě, aby startupy věděly, co tě zajímá a na čem pracuješ."
                                            : "Student o sobě zatím nic nenapsal." 
                                    }
                                </p>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className={`flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer font-semibold transition-colors mt-3 ${
                                            bioText
                                                ? 'text-gray-400 hover:text-[var(--barva-tmava)]' 
                                                : 'text-[var(--barva-primarni)] hover:opacity-80' 
                                        }`}
                                    >
                                        <Edit size={12} />
                                        {bioText ? 'Upravit bio' : 'Přidat bio'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    {profile.university && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600 pt-4 border-t border-gray-100"><GraduationCap size={20} className="flex-shrink-0" /> <span>{profile.university}</span></div>}
                    {profile.field_of_study && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600"><Briefcase size={20} className="flex-shrink-0" /> <span>{profile.field_of_study}</span></div>}
                </div>
            </div>

            {isModalOpen && (
                <ContactStudentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    studentId={profile.user_id}
                    studentName={`${profile.first_name} ${profile.last_name}`}
                    challengeId={contactState.challenge_id}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setContactState(prev => ({ ...prev, status: 'pending', can_contact: false, reason: 'already_pending' }));
                    }}
                    startupCompanyName={startupCompanyName || 'Startup'}
                />
            )}
        </>
    );
};

export default function PublicStudentProfileView({ profileId }: { profileId: string }) {
    const { user, profile: viewerProfile } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const isOwner = user?.id === profileId;

    useEffect(() => {
        setHasFetched(false);
        setProfile(null);
        setLoading(true);
    }, [profileId]);

    useEffect(() => {
        if (!hasFetched && profileId) {
            const fetchProfileData = async () => {
                const { data, error } = await supabase
                    .from('StudentProfile')
                    .select(`
                        user_id, 
                        first_name,
                        last_name,
                        username,
                        bio,
                        profile_picture_url,
                        university,
                        field_of_study,
                        level,
                        xp,
                        github_url,
                        linkedin_url,
                        dribbble_url,
                        personal_website_url,
                        recruitment_status, 
                        StudentSkill (level, xp, Skill (name)),
                        StudentLanguage (Language (name)),
                        Submission ( rating, position, is_public_on_profile, Challenge (*, ChallengeSkill(Skill(name)), StartupProfile(company_name, logo_url)) )
                    `)
                    .eq('user_id', profileId)
                    .eq('Submission.is_public_on_profile', true)
                    .single();
                
                if (data) {
                    setProfile(data as unknown as StudentProfile);
                } else {
                    console.error("Nepodařilo se načíst data studenta:", error);
                }
                setLoading(false);
                setHasFetched(true);
            };
            fetchProfileData();
        }
    }, [profileId, hasFetched]);

    if (loading || !profile) {
        return <div className='pt-32'><LoadingSpinner /></div>;
    }

    const skillsForChart = profile.StudentSkill.map(s => ({
        name: s.Skill.name,
        level: s.level,
        xp: s.xp,
    }));

    return (
        <div className="flex flex-col md:mx-20 2xl:mx-28 3xl:mx-32 py-4 md:py-32 px-4">
            {!isOwner && (
                <button
                    onClick={() => router.back()}
                    className="flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-4"
                >
                    <ChevronLeft size={16} />
                    Zpět na přehled
                </button>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-8 items-start">
                <aside className="lg:col-span-1 space-y-3 sm:space-y-8 lg:sticky lg:top-28">
                    <ProfileInfoCard 
                        profile={profile} 
                        isOwner={isOwner} 
                        viewerProfile={viewerProfile} 
                    />
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
                        <h3 className="font-bold text-lg sm:text-xl text-[var(--barva-tmava)] mb-2">Top dovednosti</h3>
                        <SkillRadarChart skills={skillsForChart} isOwner={isOwner} />
                    </div>
                </aside>
                <main className="lg:col-span-2 space-y-3 sm:space-y-8">
                    <ProfilePortfolioSection isOwner={isOwner} submissions={profile.Submission} />
                    <ProfileSkillsSection skills={profile.StudentSkill} languages={profile.StudentLanguage} isOwner={isOwner} />
                </main>
            </div>
        </div>
    );
}