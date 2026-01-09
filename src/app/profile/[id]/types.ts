export type Skill = {
    id: string;  // ZMĚNA: Povinné, bez otazníku
    name: string;
};

export type Language = {
    id?: string; // Tady zatím nechme volitelné, pokud to nepotřebujeme
    name: string;
};

export type Category = {
    name: string;
};

export type Technology = {
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
    status: 'open' | 'closed';
    deadline: string;
    startup_id: string;
    ChallengeSkill: ChallengeSkill[];
    StartupProfile?: StartupProfileInfo | null;
};

export type Submission = {
    rating: number | null;
    position: number | null;
    is_public_on_profile?: boolean;
    challenge_id: string;
    Challenge: {
        id: string;
        title: string;
        startup_id: string; 
        deadline?: string;
        status?: string;
        expected_outputs?: string;
        ChallengeSkill: { Skill: { name: string } }[];
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
    } | null;
};

export type StudentSkill = {
    skill_id?: string; 
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
    recruitment_status: 'open_to_work' | 'not_looking' | null; 
    StudentSkill: StudentSkill[];
    StudentLanguage: StudentLanguage[];
    Submission: Submission[];
};

export type StartupProfile = {
    user_id: string;
    company_name: string;
    description: string | null;
    vision: string | null;
    website: string | null;
    logo_url: string | null;
    ideal_candidate_description: string | null;
    StartupCategory: { Category: Category }[];
    StartupTechnology: { Technology: Technology }[];
    Challenge: ChallengeInfo[];
};