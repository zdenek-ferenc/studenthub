"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Check, X } from 'lucide-react';

type Question = {
    id: string;
    question_text: string;
    answer_text: string | null;
};

export default function QnaManagement() {
    const { user, showToast } = useAuth();
    const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
    const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
    const [editingAnswer, setEditingAnswer] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchQuestions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('StartupQuestion')
            .select('id, question_text, answer_text')
            .eq('startup_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Chyba při načítání dotazů:", error);
            return;
        }
        setPendingQuestions(data.filter(q => q.answer_text === null));
        setAnsweredQuestions(data.filter(q => q.answer_text !== null));
    }, [user]);

    useEffect(() => {
        if (user && !hasFetched) {
            setLoading(true);
            fetchQuestions().then(() => {
                setLoading(false);
                setHasFetched(true);
            });
        }
    }, [user, fetchQuestions, hasFetched]);

    const handleAnswer = async (questionId: string) => {
        const answer = editingAnswer[questionId];
        if (!answer || !answer.trim()) {
            showToast('Odpověď nemůže být prázdná.', 'error');
            return;
        }

        const { error } = await supabase
            .from('StartupQuestion')
            .update({ answer_text: answer, answered_at: new Date().toISOString() })
            .eq('id', questionId);
        
        if (error) showToast('Uložení odpovědi selhalo.', 'error');
        else {
            showToast('Odpověď byla zveřejněna!', 'success');
            fetchQuestions();
        }
    };

    const handleReject = async (questionId: string) => {
        const { error } = await supabase.from('StartupQuestion').delete().eq('id', questionId);
        if (error) showToast('Smazání dotazu selhalo.', 'error');
        else {
            showToast('Dotaz byl smazán.', 'success');
            fetchQuestions();
        }
    };
    
    if (loading) return <p>Načítám dotazy...</p>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border space-y-8">
            <div>
                <h3 className="text-lg font-bold text-[var(--barva-tmava)]">Čeká na odpověď ({pendingQuestions.length})</h3>
                <div className="space-y-4 mt-4">
                    {pendingQuestions.length > 0 ? pendingQuestions.map(q => (
                        <div key={q.id} className="p-4 bg-gray-50 rounded-lg border">
                            <p className="text-gray-800 italic">{q.question_text}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="text"
                                    placeholder="Napište odpověď..."
                                    className="input flex-grow !font-normal !text-sm"
                                    onChange={(e) => setEditingAnswer(prev => ({ ...prev, [q.id]: e.target.value }))}
                                />
                                <button onClick={() => handleAnswer(q.id)} className="p-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"><Check size={16}/></button>
                                <button onClick={() => handleReject(q.id)} className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"><X size={16}/></button>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500">Žádné nové dotazy.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-[var(--barva-tmava)]">Zveřejněné dotazy ({answeredQuestions.length})</h3>
                <div className="space-y-4 mt-4">
                    {answeredQuestions.map(q => (
                        <div key={q.id} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                            <p className="font-semibold text-gray-800">Otázka: {q.question_text}</p>
                            <p className="mt-2 text-gray-600">Odpověď: {q.answer_text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}