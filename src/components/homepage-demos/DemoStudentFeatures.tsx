// Soubor: src/components/homepage-demos/DemoStudentFeatures.tsx

"use client";

import { Star, Trophy, Info, X } from 'lucide-react';
import Image from 'next/image';
import SkillRadarChart from '../../app/profile/[id]/components/SkillRadarChart';
import { useState } from 'react';
import FeatureTooltip, { MODAL_CONTENT_MAP } from './FeatureTooltip';

const mockSkills = [
  { name: 'React', level: 7, xp: 100 },
  { name: 'Python', level: 8, xp: 150 },
  { name: 'Figma', level: 4, xp: 50 },
  { name: 'UI/UX', level: 6, xp: 150 },
  { name: 'Node.js', level: 3, xp: 80 },
];

const mockPortfolio1 = {
  rating: 9,
  position: 1,
  Challenge: {
    title: 'Landing page pro SaaS',
    StartupProfile: {
      company_name: 'Inovace s.r.o.',
      logo_url: '/rhlogo.svg',
    },
    ChallengeSkill: [{ Skill: { name: 'React' } }, { Skill: { name: 'Figma' } },{ Skill: { name: 'Next.js' } }],
  },
};
const mockPortfolio2 = {
  rating: 8,
  position: 2,
  Challenge: {
    title: 'Marketingová strategie',
    StartupProfile: {
      company_name: 'TechSolutions',
      logo_url: '/virtigodigital-logo.svg',
    },
    ChallengeSkill: [{ Skill: { name: 'Marketing' } }, { Skill: { name: 'AI' }}, { Skill: { name: 'Sociální sítě' } }],
  },
};

const mockTopSkills = [
    { name: 'Python', level: 8, percentage: 30 },
    { name: 'React', level: 7, percentage: 80 },
    { name: 'UI/UX', level: 6, percentage: 45 },
    { name: 'Figma', level: 4, percentage: 90 },
];

type PortfolioData = typeof mockPortfolio1;
const DemoPortfolioCard = ({ portfolio }: { portfolio: PortfolioData }) => {
  const { Challenge, rating, position } = portfolio;
  const skills = Challenge.ChallengeSkill.map(cs => cs.Skill.name);

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-xs h-fit flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={Challenge.StartupProfile.logo_url || '/logo.svg'}
          alt={Challenge.StartupProfile.company_name}
          width={40}
          height={40}
          className="rounded-lg w-10 h-10 object-cover"
        />
        <div>
          <h4 className="font-bold text-base text-[var(--barva-tmava)] line-clamp-1">{Challenge.title}</h4>
          <p className="text-sm text-gray-500">{Challenge.StartupProfile.company_name}</p>
        </div>
      </div>
      <div className="flex-grow mb-2 lg:mb-4">
        <div className="flex flex-wrap gap-2">
          {skills.map(name => (
            <span key={name} className="px-2.5 py-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)] rounded-full text-xs font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-3 lg:border-t border-gray-100 flex justify-end gap-2">
        {position && position <= 3 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                <Trophy size={14} />
                <span>{position}. místo</span>
            </div>
        )}
        <div className="flex items-center gap-1.5 text-sm font-semibold bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] px-3 py-1 rounded-full">
          <Star size={14} />
          <span>{rating} / 10</span>
        </div>
      </div>
    </div>
  );
};

const SkillLevelDisplay = ({ name, level, percentage }: { name: string, level: number, percentage: number }) => (
  <div 
      className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full text-[11px] sm:text-[13px] font-medium w-fit"
  >
      <span>{name}</span>
      <div 
          className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full grid place-items-center"
          style={{
              background: `conic-gradient(var(--barva-primarni) ${percentage}%, var(--barva-primarni2) ${percentage}%)`
          }}
          title={`${percentage}% k dalšímu levelu`}
      >
          <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />          
          <span className="relative z-10 text-[var(--barva-primarni)] text-[8px] sm:text-[10px] font-bold">
              {level}
          </span>
      </div>
  </div>
);


export default function DemoStudentFeatures() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleToggle = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(prev => (prev === key ? null : key));
  };

  const handleSectionClick = () => {
    if (activeTooltip) {
      setActiveTooltip(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onClick={handleSectionClick}>     
      <div> 
        <h3 className="mb-2 text-lg font-semibold">Růst Dovedností</h3>
        <div className="relative p-6 bg-white rounded-2xl shadow-xs border-2 border-gray-100">
          <button
            onClick={(e) => handleToggle('radar', e)}
            className="absolute top-4 cursor-pointer right-4 z-10 w-8 h-8 flex items-center justify-center bg-blue-100 text-[var(--barva-primarni)] rounded-full hover:bg-blue-200 transition-all"
            title="Co to je?"
          >
            {activeTooltip === 'radar' ? <X size={18} /> : <Info size={18} />}
          </button>
          
          <FeatureTooltip
            content={MODAL_CONTENT_MAP['radar']}
            isOpen={activeTooltip === 'radar'}
            onClose={() => setActiveTooltip(null)}
          />
          
          <SkillRadarChart skills={mockSkills} isOwner={false} />

          <div className="lg:mt-6 lg:pt-6 lg:border-t border-gray-100">
            <h4 className="font-semibold text-gray-500 uppercase text-xs mb-3">Top Dovednosti</h4>
            <div className="flex flex-wrap gap-2">
              {mockTopSkills.map(skill => (
                <SkillLevelDisplay
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  percentage={skill.percentage}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div> 
        <h3 className="mb-2 text-lg font-semibold">Portfolio Úspěchů</h3>
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={(e) => handleToggle('portfolio', e)}
              className="absolute cursor-pointer top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-blue-100 text-[var(--barva-primarni)] rounded-full hover:bg-blue-200 transition-all"
              title="Co to je?"
            >
              {activeTooltip === 'portfolio' ? <X size={18} /> : <Info size={18} />}
            </button>
            
            <FeatureTooltip
              content={MODAL_CONTENT_MAP['portfolio']}
              isOpen={activeTooltip === 'portfolio'}
              onClose={() => setActiveTooltip(null)}
            />
            
            <DemoPortfolioCard portfolio={mockPortfolio1} />
          </div>
            <DemoPortfolioCard portfolio={mockPortfolio2}/>
        </div>
      </div>
    </div>
  );
}