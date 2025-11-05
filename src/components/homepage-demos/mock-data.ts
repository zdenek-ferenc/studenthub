export type MockChallenge = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  reward_type: 'financial' | 'non-financial' | 'internship';
  reward_financial: { first_place: number, second_place?: number, third_place?: number } | null;
  reward_nonfinancial: string | null;
  status: 'open' | 'closed' | 'draft' | 'judging';
  max_participants: number | null;
  participant_count: number;
  ChallengeSkill: { Skill: { name: string } }[];
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

export type MockStudent = {
  user_id: string; 
  username: string;
  first_name: string; 
  last_name: string;
  profile_picture_url: string | null;
  bio: string | null;
  level: number;
  xp: number;
  StudentSkill: {
    Skill: {
      id: string;
      name: string;
    };
  }[];
};

export type MockCareerData = {
  totalLevel: number;
  totalXp: number;
  xpForNextLevel: number;
  topSkills: {
    name: string;
    level: number;
    xp: number;
    nextLevelXp: number;
  }[];
};


const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 14);

export const mockChallengeData1: MockChallenge = {
  id: 'demo-1',
  title: 'Vytvoř landing page pro náš nový SaaS',
  description: 'Hledáme kreativního studenta, který navrhne a nakóduje moderní landing page...',
  deadline: futureDate.toISOString(),
  reward_type: 'financial',
  reward_financial: { first_place: 5000, second_place: 2000 },
  reward_nonfinancial: null,
  status: 'open',
  max_participants: 20,
  participant_count: 8,
  ChallengeSkill: [{ Skill: { name: 'React' } }, { Skill: { name: 'UI/UX Design' } }, { Skill: { name: 'Figma' } }],
  StartupProfile: {
    company_name: 'RiseHigh',
    logo_url: '/logosmall.svg',
  },
};

export const mockChallengeData2: MockChallenge = {
  id: 'demo-2',
  title: 'Marketingová strategie pro AI tool',
  description: 'Pomozte nám s go-to-market strategií pro náš nový AI nástroj...',
  deadline: futureDate.toISOString(),
  reward_type: 'internship',
  reward_financial: null,
  reward_nonfinancial: 'Placená stáž pro vítěze',
  status: 'open',
  max_participants: 10,
  participant_count: 2,
  ChallengeSkill: [{ Skill: { name: 'Marketing' } }, { Skill: { name: 'Analýza dat' } }, { Skill: { name: 'AI' } }],
  StartupProfile: {
    company_name: 'RiseHigh',
    logo_url: '/logosmall.svg', 
  },
};



export const mockStudentData1: MockStudent = {
  user_id: 'demo-s1', 
  username: 'anicka_v',
  first_name: 'Anna',
  last_name: 'Vzorová', 
  profile_picture_url: null,
  bio: 'Studentka FI MUNI se zájmem o React a AI. Hledám nové výzvy, kde se mohu učit.',
  level: 8,
  xp: 150,
  StudentSkill: [
    { Skill: { id: 's1', name: 'Python' } },
    { Skill: { id: 's2', name: 'React' } },
    { Skill: { id: 's3', name: 'JavaScript' } },
  ],
};

export const mockStudentData2: MockStudent = {
  user_id: 'demo-s2',
  username: 'pavel_novy',
  first_name: 'Pavel', 
  last_name: 'Novák',
  profile_picture_url: null,
  bio: 'Designér na volné noze, miluji čisté UI a funkční UX. Ovládám Figmu na expertní úrovni.',
  level: 12,
  xp: 450,
  StudentSkill: [
    { Skill: { id: 's4', name: 'Figma' } },
    { Skill: { id: 's5', name: 'UI/UX Design' } },
    { Skill: { id: 's6', name: 'Webflow' } },
  ],
};

export const mockCareerData: MockCareerData = {
  totalLevel: 8,
  totalXp: 150,
  xpForNextLevel: 1200,
  topSkills: [
    { name: 'React', level: 7, xp: 200, nextLevelXp: 900 },
    { name: 'Python', level: 10, xp: 50, nextLevelXp: 1800 },
    { name: 'Figma', level: 4, xp: 120, nextLevelXp: 450 },
  ],
};