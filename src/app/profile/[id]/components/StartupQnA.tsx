"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { MessageSquare, Send } from 'lucide-react';

type Question = {
    id: string;
    question_text: string;
    answer_text: string | null;
    created_at: string;
};


export default function StartupQnA({ startupId }: { startupId: string }) {
    const { user, profile, showToast } = useAuth(); 
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from('StartupQuestion')
                .select('id, question_text, answer_text, created_at')
                .eq('startup_id', startupId)
                .not('answer_text', 'is', null) 
                .order('created_at', { ascending: false });

            setQuestions(data || []);
            setIsLoading(false);
        };
        fetchQuestions();
    }, [startupId]);

    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim() || !user || !profile || profile.role !== 'student') return;

        setIsSubmitting(true);

        console.log('User ID being sent:', user.id); 
            console.log('Data being inserted:', { 
                startup_id: startupId,
                asker_id: user.id,
                question_text: newQuestion,
});

        const { data: insertedQuestion, error: insertError } = await supabase
            .from('StartupQuestion')
            .insert({
                startup_id: startupId,
                asker_id: user.id,
                question_text: newQuestion,
            })
            .select('id') 
            .single();

        if (insertError || !insertedQuestion) {
            showToast('Odeslání dotazu se nezdařilo.', 'error');
            console.error("Chyba při vkládání otázky:", insertError.message || insertError);
            setIsSubmitting(false);
            return;
        }

        try {
            const notificationMessage = `Talent položil/a novou otázku k vašemu profilu.`;
            const notificationLink = `/profile/recruitment?tab=qna`;

            const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                    user_id: startupId,
                    message: notificationMessage,
                    link_url: notificationLink,
                });

            if (notificationError) {
                console.error("Chyba při vytváření notifikace:", notificationError);
                showToast('Dotaz byl odeslán! Chyba při notifikaci startupu.', 'success');
            } else {
                showToast('Dotaz byl odeslán! Zobrazí se po schválení a zodpovězení.', 'success');
            }
            setNewQuestion('');

        } catch (error) {
            console.error("Neočekávaná chyba při zpracování notifikace:", error);
            showToast('Dotaz byl odeslán! Chyba při následném zpracování.', 'success');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            <h2 className="text-lg sm:text-2xl font-bold text-[var(--barva-tmava)] mb-4">Zeptej se nás</h2>
            {isLoading ? <div className="text-center py-6"><LoadingSpinner/></div> : ( 
                <div className="space-y-4 py-3">
                    {questions.length > 0 ? (
                        questions.map(q => (
                            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border">
                                <p className="font-semibold text-gray-800">{q.question_text}</p>
                                <p className="mt-2 text-gray-600 border-l-4 border-blue-300 pl-3">{q.answer_text}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                            <p>Zatím žádné dotazy. {profile?.role === 'student' ? 'Buď první!' : ''}</p> 
                        </div>
                    )}
                </div>
            )}
            {profile?.role === 'student' && ( 
                <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Napiš svůj dotaz..."
                        className="input flex-grow !font-normal"
                        disabled={isSubmitting}
                    />
                    <button type="submit" disabled={isSubmitting || !newQuestion.trim()} className="p-3 rounded-full cursor-pointer bg-[var(--barva-primarni)] text-white hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-[44px] h-[44px]">
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}