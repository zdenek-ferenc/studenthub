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
        <div className="relative bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            {isOwner && (
                <Link
                    href="/profile/edit"
                    title="Upravit profil"
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:bg-[var(--barva-primarni2)] hover:text-[var(--barva-primarni)] transition-colors z-10"
                >
                    <Settings size={16} />
                </Link>
            )}

            <div className="flex flex-col sm:block">
                <div className="flex flex-row sm:block items-center sm:text-center gap-3 sm:gap-0">
                    <div className="h-14 w-14 sm:w-24 sm:h-24 flex-shrink-0 rounded-full sm:mx-auto sm:mb-4 relative">
                        {profile.profile_picture_url ? (
                            <Image
                                src={profile.profile_picture_url}
                                alt={`Profilový obrázek ${profile.first_name} ${profile.last_name}`}
                                width={200}
                                height={200}
                                className="h-14 w-14 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
                                key={profile.profile_picture_url}
                            />
                        ) : (
                            <div className="h-14 w-14 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[var(--barva-primarni2)] to-[var(--barva-primarni2)]/70 text-[var(--barva-primarni)] flex items-center justify-center text-lg sm:text-4xl font-bold">
                                {initials}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 sm:w-full">
                        <div className="flex flex-col sm:block items-start sm:items-center">
                            <h1 className="text-base sm:text-2xl font-bold text-[var(--barva-tmava)] leading-tight truncate">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-base truncate w-full sm:w-auto">@{profile.username}</p>
                            
                            <div className="mt-1 sm:mt-3 h-auto sm:h-8 flex sm:justify-center origin-left scale-90 sm:scale-100 sm:origin-center">
                                <RecruitmentStatusTag status={profile.recruitment_status} isOwner={isOwner} viewerRole={viewerProfile?.role || null} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col sm:block gap-3">
                    <div className="max-w-xs mx-auto w-full">
                        <ContactStudentButton profile={profile} isOwner={isOwner} viewerProfile={viewerProfile} />
                    </div>

                    <div className="flex justify-center items-center gap-3 sm:gap-4 sm:mt-4 flex-wrap">
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
            </div>

            <div className="text-sm space-y-2 sm:space-y-4 mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="line-clamp-2 sm:line-clamp-none">
                    <ProfileBio bio={profile.bio} isOwner={isOwner} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 pt-1 sm:pt-4 sm:border-t sm:border-gray-100">
                     {profile.university && <div className="flex items-center gap-1.5"><GraduationCap size={16} className="flex-shrink-0 sm:w-5 sm:h-5" /> <span className="line-clamp-1">{profile.university}</span></div>}
                     {profile.field_of_study && <div className="flex items-center gap-1.5"><Briefcase size={16} className="flex-shrink-0 sm:w-5 sm:h-5" /> <span className="line-clamp-1">{profile.field_of_study}</span></div>}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfoCard;
