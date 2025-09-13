"use client";

// Vytvořili jsme typy, které přesně odpovídají struktuře dat ze Supabase
type SkillData = {
  Skill: {
    id: string;
    name: string;
  }
};

type LanguageData = {
  Language: {
    id: string;
    name: string;
  }
};

// Používáme naše nové typy místo 'any[]'
export default function ProfileSkillsCard({ skills, languages }: { skills: SkillData[], languages: LanguageData[] }) {
  return (
    <div className="bg-white p-10 rounded-2xl flex mt-3 flex-col gap-12 shadow-xs">
      <div>
      <h3 className="text-2xl mb-4 text-[var(--barva-tmava)] font-semibold">Dovednosti</h3>
      <div className="flex flex-wrap gap-3">
        {/* Kontrolujeme, jestli pole existuje a má nějaké prvky */}
        {skills && skills.length > 0 ? (
          skills.map(skill => <span key={skill.Skill.id} className="px-4 py-1 bg-[var(--barva-svetle-pozadi)] border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full outline-2 transition-colors duration-200 font-semibold">{skill.Skill.name}</span>)
        ) : (
          <p className="text-gray-500 text-sm">Zatím žádné dovednosti.</p>
        )}
      </div>  
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-[var(--barva-tmava)]">Jazyky</h3>
      <div className="flex flex-wrap gap-3">
        {languages && languages.length > 0 ? (
          languages.map(lang => <span key={lang.Language.id} className="px-4 py-1 bg-[var(--barva-svetle-pozadi)] border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full outline-2 transition-colors duration-200 font-semibold">{lang.Language.name}</span>)
        ) : (
          <p className="text-gray-500 text-sm">Zatím žádné jazyky.</p>
        )}
      </div>
      </div>
    </div>
  );
}
