"use client";

import Link from 'next/link';
import { Target, UserPlus } from "lucide-react";

// Přesné typy pro props
type Technology = {
    Technology: { name: string };
};

export type IdealCandidateCardProps = {
    description: string | null;
    technologies: Technology[];
    isOwner: boolean;
    hasData: boolean;
    isPreview?: boolean;
};

export default function IdealCandidateCard({ description, technologies, isOwner, hasData, isPreview = false }: IdealCandidateCardProps) {
    // --- ZDE JE KLÍČOVÁ OPRAVA LOGIKY ---

    // Pokud je komponenta použita v živém náhledu, VŽDY zobrazíme finální modrou kartu.
    // Pro prázdné hodnoty použijeme zástupný text (placeholder).
    if (isPreview) {
        return (
            <div className="bg-gradient-to-br from-[var(--barva-tmava)] to-[#002952] text-white p-6 rounded-2xl shadow-lg border-t border-blue-400/30">
                <div className="flex items-center gap-3 mb-4">
                    <Target size={24} className="text-[var(--barva-primarni)]" />
                    <h3 className="text-xl font-bold">Hledáme právě tebe!</h3>
                </div>
                
                <p className="text-blue-100 mb-4 min-h-[40px] italic opacity-75">
                    {description || "Zde se zobrazí váš popis ideálního kandidáta..."}
                </p>
                
                <div>
                    <h4 className="font-semibold text-sm text-blue-200 mb-2">Klíčové technologie:</h4>
                    <div className="flex flex-wrap gap-2 min-h-[26px]">
                        {technologies.length > 0 ? technologies.map((tech, index) => (
                            <span key={index} className="px-2.5 py-1 bg-blue-900/50 text-blue-200 rounded-md text-xs font-medium">
                                {tech.Technology.name}
                            </span>
                        )) : (<span className="px-2.5 py-1 bg-blue-900/50 text-blue-300/50 rounded-md text-xs italic">Zde budou vaše technologie...</span>)}
                    </div>
                </div>
            </div>
        );
    }

    // Následující logika se uplatní POUZE na veřejném profilu (kde isPreview = false)
    if (!hasData) {
        // Pokud se dívá majitel a data nejsou, zobrazí se call-to-action
        if (isOwner) {
            return (
                <div className="bg-white p-6 rounded-2xl shadow-xs border-2 border-dashed border-gray-300 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <UserPlus size={24} className="text-[var(--barva-primarni)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--barva-tmava)]">Přilákejte ty správné talenty</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4 max-w-xs">Definujte, koho hledáte, a zvyšte tak relevanci přihlášených studentů.</p>
                    <Link href="/profile/recruitment" className="px-5 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-sm cursor-pointer hover:opacity-90">
                        Definovat kandidáta
                    </Link>
                </div>
            );
        }
        // Pokud se dívá kdokoliv jiný a data nejsou, nezobrazí se nic
        return null;
    }

    // Standardní zobrazení, když karta má data na veřejném profilu
    return (
        <div className="bg-gradient-to-br from-[var(--barva-tmava)] to-[#002952] text-white p-3 sm:p-6 rounded-2xl shadow-lg border-t border-blue-400/30">
            <div className="flex items-center gap-3 mb-4">
                <Target size={24} className="text-[var(--barva-primarni)]" />
                <h3 className="text-base sm:text-xl font-bold">Hledáme právě tebe!</h3>
            </div>
            {description && <p className="sm:text-base text-sm text-blue-100 mb-4">{description}</p>}
            <div>
                <h4 className="font-semibold text-sm text-blue-200 mb-2">Klíčové technologie:</h4>
                <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, index) => (
                        <span key={index} className="px-2.5 py-1 ring-1 ring-blue-200 bg-blue-900/50 text-blue-200 rounded-xl text-xs font-medium">
                            {tech.Technology.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}