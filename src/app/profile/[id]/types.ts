export type Skill = {
    name: string;
};

export type Language = {
    name: string;
};

export type ChallengeSkill = {
    Skill: Skill;
};

export type StartupProfileInfo = {
    company_name: string;
    logo_url: string | null;
};

export type ChallengeInfo = {
    id: string;
    title: string;
    startup_id: string;
    ChallengeSkill: ChallengeSkill[];
    StartupProfile: StartupProfileInfo | null;
};

export type Submission = {
    rating: number | null;
    position: number | null;
    is_public_on_profile?: boolean;
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

export type StudentSkill = {
    level: number;
    xp: number;
    Skill: Skill;
};

export type StudentLanguage = {
    Language: Language;
};

export type StudentProfile = {
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
