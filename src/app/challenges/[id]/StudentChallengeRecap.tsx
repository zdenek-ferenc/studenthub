"use client";

import type { Submission } from './SubmissionCard';
import { Star, Trophy, MessageSquareText, Download } from 'lucide-react'; // Správně naimportujeme všechny ikony

export default function StudentChallengeRecap({ submission }: { submission: Submission }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xs mt-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--barva-tmava)]">Výsledky tvého řešení</h2>
                <p className="text-lg text-gray-600 mt-2">Výzva je již uzavřena. Zde je zpětná vazba od startupu.</p>
            </div>

            {/* Sekce s hodnocením a umístěním */}
            <div className="flex justify-around items-center p-4 max-w-lg mx-auto">
                {submission.position && [1, 2, 3].includes(submission.position) && (
                    <div className="text-center px-4">
                        <p className="text-sm font-semibold text-gray-500">Tvoje umístění</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Trophy className="w-8 h-8 text-amber-500" />
                            <p className="text-2xl font-bold text-gray-800">{submission.position}. místo</p>
                        </div>
                    </div>
                )}
                {submission.rating && (
                    <div className="text-center px-4">
                        <p className="text-sm font-semibold text-gray-500">Finální hodnocení</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="w-8 h-8 text-blue-500" />
                            <p className="text-2xl font-bold text-gray-800">{submission.rating} / 10</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Zpětná vazba a stažení */}
            <div className="max-w-2xl mx-auto mt-8 space-y-6">
                {submission.feedback_comment && (
                    <div>
                        <h5 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-lg">
                            <MessageSquareText className="w-6 h-6" />
                            Zpětná vazba od startupu
                        </h5>
                        <blockquote className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded-r-lg">
                            <p className="italic">{submission.feedback_comment}</p>
                        </blockquote>
                    </div>
                )}
                
                {(submission.file_url || submission.link) && (
                     <div>
                        <h5 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-lg">
                            <Download className="w-6 h-6" />
                            Tvoje odevzdané řešení
                        </h5>
                        <a 
                            href={submission.file_url || submission.link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Stáhnout
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}