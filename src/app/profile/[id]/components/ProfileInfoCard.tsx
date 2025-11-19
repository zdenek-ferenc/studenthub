import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Github,
    Linkedin,
    Dribbble,
    Link as LinkIcon,
    Briefcase,
    GraduationCap,
    Settings,
    PlusCircle
} from 'lucide-react';
import { Profile } from '../../../../contexts/AuthContext';
import { StudentProfile } from '../types';
import SocialLink from './SocialLink';
import RecruitmentStatusTag from './RecruitmentStatusTag';
import ProfileBio from './ProfileBio';
import ContactStudentButton from './ContactStudentButton';

interface ProfileInfoCardProps {
    profile: StudentProfile;
    isOwner: boolean;
    viewerProfile: Profile | null;
}

const ProfileInfoCard = ({ profile, isOwner, viewerProfile }: ProfileInfoCardProps) => {
    const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
    const hasAnyLink = !!(profile.linkedin_url || profile.github_url || profile.dribbble_url || profile.personal_website_url);

    return (
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
                    <ContactStudentButton profile={profile} isOwner={isOwner} viewerProfile={viewerProfile} />
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
                <ProfileBio bio={profile.bio} isOwner={isOwner} />
                {profile.university && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600 pt-4 border-t border-gray-100"><GraduationCap size={20} className="flex-shrink-0" /> <span>{profile.university}</span></div>}
                {profile.field_of_study && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600"><Briefcase size={20} className="flex-shrink-0" /> <span>{profile.field_of_study}</span></div>}
            </div>
        </div>
    );
};

export default ProfileInfoCard;
