"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { MessageSquare, Send } from 'lucide-react';

type Question = {
    id: string;
    question_text: string;
    answer_text: string | null;
    created_at: string;
};

export default function StartupQnA({ startupId }: { startupId: string }) {
    const { user, showToast } = useAuth();
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
                .not('answer_text', 'is', null) // Zobrazíme jen zodpovězené
                .order('created_at', { ascending: false });
            
            setQuestions(data || []);
            setIsLoading(false);
        };
        fetchQuestions();
    }, [startupId]);

    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim() || !user) return;

        setIsSubmitting(true);
        const { error } = await supabase
            .from('StartupQuestion')
            .insert({
                startup_id: startupId,
                asker_id: user.id,
                question_text: newQuestion,
            });
        
        if (error) {
            showToast('Odeslání dotazu se nezdařilo.', 'error');
        } else {
            setNewQuestion('');
            showToast('Dotaz byl odeslán! Zobrazí se po schválení a zodpovězení.', 'success');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h2 className="text-2xl font-bold text-[var(--barva-tmava)] mb-4">Zeptej se nás</h2>
            
            {user?.role === 'student' && (
                <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2 mb-6">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Napiš svůj dotaz..."
                        className="input flex-grow !font-normal"
                    />
                    <button type="submit" disabled={isSubmitting} className="p-3 rounded-full bg-[var(--barva-primarni)] text-white hover:opacity-90 transition-opacity disabled:bg-gray-400">
                        <Send size={20} />
                    </button>
                </form>
            )}

            {isLoading ? <p>Načítám dotazy...</p> : (
                <div className="space-y-4">
                    {questions.length > 0 ? (
                        questions.map(q => (
                            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border">
                                <p className="font-semibold text-gray-800">Otázka: {q.question_text}</p>
                                <p className="mt-2 text-gray-600 border-l-4 border-blue-300 pl-3">Odpověď: {q.answer_text}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                            <p>Zatím žádné dotazy. Buď první!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}