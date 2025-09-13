"use client";

import { useMemo } from 'react';
import type { Submission } from './SubmissionCard';
import { Download, MessageSquareText } from 'lucide-react';

// --- SUB-KOMPONENTA: KARTA PRO JEDNOHO VÍTĚZE ---
const SingleWinnerCard = ({ submission }: { submission: Submission }) => {
    const student = submission.StudentProfile;
    return (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl text-center">
            <h3 className="text-3xl font-semibold text-[var(--barva-primarni)]">Vítěz Výzvy</h3>
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-3xl my-6 mx-auto border-4 border-white shadow-lg">
                {student?.first_name?.[0]}{student?.last_name?.[0]}
            </div>
            <p className="text-2xl font-bold text-gray-800">{student?.first_name} {student?.last_name}</p>
            <p className="text-md text-gray-500 mb-6">@{student?.username}</p>
            
            {submission.feedback_comment && (
                <div className="text-left mb-6">
                    <h5 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <MessageSquareText className="w-5 h-5" />
                        Vaše zpětná vazba
                    </h5>
                    <p className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg text-sm italic">
                        {submission.feedback_comment}
                    </p>
                </div>
            )}

            <a 
                href={submission.file_url || submission.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[var(--barva-primarni)] font-semibold"
            >
                <Download className="w-5 h-5" />
                Stáhnout vítězné řešení
            </a>
        </div>
    );
};

// --- SUB-KOMPONENTA: SEZNAM VÍTĚZŮ POD PÓDIEM ---
const WinnerListItem = ({ submission }: { submission: Submission }) => {
    const student = submission.StudentProfile;
    const placeText: { [key: number]: string } = { 1: "1st", 2: "2nd", 3: "3rd" };

    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xl font-bold text-gray-400 w-10 text-center">{placeText[submission.position!]}</div>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                {student?.first_name?.[0]}{student?.last_name?.[0]}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800">{student?.first_name} {student?.last_name}</p>
                <p className="text-sm text-gray-500 -mt-1">@{student?.username}</p>
            </div>
            <a 
                href={submission.file_url || submission.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
                <Download className="w-4 h-4" />
                <span>Řešení</span>
            </a>
        </div>
    );
};

// --- HLAVNÍ KOMPONENTA PRO REKAPITULACI ---
export default function ChallengeRecapView({ submissions }: { submissions: Submission[] }) {
    
    const winners = useMemo(() => {
        return submissions
            .filter(s => s.position && [1, 2, 3].includes(s.position))
            .sort((a, b) => a.position! - b.position!);
    }, [submissions]);

    // Pořadí pro vizuální zobrazení na pódiu (2, 1, 3)
    const podiumOrder = [
        winners.find(w => w.position === 2),
        winners.find(w => w.position === 1),
        winners.find(w => w.position === 3)
    ].filter(Boolean) as Submission[];

    // Výšky sloupců pro pódium
    const barHeights: { [key: number]: string } = { 1: 'h-48', 2: 'h-40', 3: 'h-32' };

    const renderContent = () => {
        if (winners.length === 1) {
            return <SingleWinnerCard submission={winners[0]} />;
        }
        
        if (winners.length > 1) {
            return (
                <>
                    {/* VIZUÁLNÍ GRAF VÍTĚZŮ (PÓDIUM) */}
                    <div className="flex justify-center items-end gap-4 sm:gap-8 h-64 mb-12">
                        {podiumOrder.map(winner => (
                            <div key={winner.id} className="flex flex-col items-center relative w-1/3 max-w-[120px]">
                                {/* Avatar */}
                                <div className="absolute -top-6 w-16 h-16 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center font-bold text-gray-500 text-xl shadow-md">
                                    {winner.StudentProfile?.first_name?.[0]}{winner.StudentProfile?.last_name?.[0]}
                                </div>
                                {/* Sloupec grafu */}
                                <div className={`w-full rounded-t-lg bg-[var(--barva-primarni2)] flex flex-col justify-end items-center p-2 text-center ${barHeights[winner.position!]}`}>
                                    <p className="font-bold text-2xl text-[var(--barva-primarni)]">{winner.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SEZNAM VÍTĚZŮ */}
                    <div className="space-y-3 max-w-2xl mx-auto">
                        {winners.map(winner => (
                            <WinnerListItem key={winner.id} submission={winner} />
                        ))}
                    </div>
                </>
            );
        }

        return <p className="text-center text-gray-500">Nebyly vyhlášeny žádné vítězné pozice.</p>;
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xs">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--barva-tmava)]">Výzva je uzavřena</h2>
                <p className="text-lg text-gray-600 mt-2">Děkujeme za účast a zde jsou finální výsledky.</p>
            </div>
            {renderContent()}
        </div>
    );
}

