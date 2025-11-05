"use client";

import { Star, Trophy, Info, X } from 'lucide-react';
import Image from 'next/image';
import SkillRadarChart from '../../app/profile/[id]/components/SkillRadarChart';
import { useState } from 'react';
import FeatureTooltip, { MODAL_CONTENT_MAP } from './FeatureTooltip';

const mockSkills = [
  { name: 'React', level: 7, xp: 100 },
  { name: 'Python', level: 10, xp: 200 },
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
      logo_url: '/logosmall.svg',
    },
    ChallengeSkill: [{ Skill: { name: 'React' } }, { Skill: { name: 'Figma' } }],
  },
};

const mockPortfolio2 = {
  rating: 8,
  position: 2,
  Challenge: {
    title: 'Marketingová strategie',
    StartupProfile: {
      company_name: 'TechSolutions',
      logo_url: '/logosmall.svg',
    },
    ChallengeSkill: [{ Skill: { name: 'Marketing' } }, { Skill: { name: 'AI' } }],
  },
};

type PortfolioData = typeof mockPortfolio1; 

const DemoPortfolioCard = ({ portfolio }: { portfolio: PortfolioData }) => {
  const { Challenge, rating, position } = portfolio;
  const skills = Challenge.ChallengeSkill.map(cs => cs.Skill.name);

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm h-1/2 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={Challenge.StartupProfile.logo_url || '/logo.svg'}
          alt={Challenge.StartupProfile.company_name}
          width={40}
          height={40}
          className="rounded-lg bg-[var(--barva-primarni)] w-10 h-10 object-contain p-1"
        />
        <div>
          <h4 className="font-bold text-base text-[var(--barva-tmava)] line-clamp-1">{Challenge.title}</h4>
          <p className="text-sm text-gray-500">{Challenge.StartupProfile.company_name}</p>
        </div>
      </div>
      <div className="flex-grow mb-4">
        <div className="flex flex-wrap gap-2">
          {skills.map(name => (
            <span key={name} className="px-2.5 py-1 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] rounded-full text-[var(--barva-primarni)] text-xs font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end gap-2">
        {position && position <= 3 && ( 
            <div className="flex items-center gap-1.5 text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                <Trophy size={14} />
                <span>{position}. místo</span>
            </div>
        )}
        <div className="flex items-center gap-1.5 text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          <Star size={14} />
          <span>{rating} / 10</span>
        </div>
      </div>
    </div>
  );
};

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
      
      <div className="relative flex items-center p-6 bg-white rounded-2xl shadow-sm border-2 border-gray-100">
        <button
          onClick={(e) => handleToggle('radar', e)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-blue-100 text-[var(--barva-primarni)] rounded-full cursor-pointer ease-in-out duration-200 hover:bg-blue-200 transition-all"
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
      </div>
      <div className="space-y-4">
        
        <div className="relative">
          <button
            onClick={(e) => handleToggle('portfolio', e)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center cursor-pointer ease-in-out duration-200 bg-blue-100 text-[var(--barva-primarni)] rounded-full hover:bg-blue-200 transition-all"
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
        <DemoPortfolioCard portfolio={mockPortfolio2} />
        
      </div>
    </div>
  );
}