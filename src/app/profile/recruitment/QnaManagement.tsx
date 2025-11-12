"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Check, Trash, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../../components/ConfirmationModal';
import LoadingSpinner from '@/components/LoadingSpinner';

type Question = {
    id: string;
    question_text: string;
    answer_text: string | null;
    answered_at?: string | null;
};

export default function QnaManagement() {
    const { user, showToast } = useAuth();
    const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
    const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
    const [editingAnswer, setEditingAnswer] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [questionToDeleteId, setQuestionToDeleteId] = useState<string | null>(null);

    const fetchQuestions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('StartupQuestion')
            .select('id, question_text, answer_text, answered_at')
            .eq('startup_id', user.id)
            .order('answer_text', { nullsFirst: true })
            .order('answered_at', { ascending: false });

        if (error) {
            console.error("Chyba při načítání dotazů:", error);
            showToast('Načítání dotazů selhalo.', 'error');
            return;
        }
        setPendingQuestions(data.filter(q => q.answer_text === null));
        setAnsweredQuestions(data.filter(q => q.answer_text !== null));
        setEditingAnswer({});

    }, [user, showToast]); 

    useEffect(() => {
        if (user && !hasFetched) {
            setLoading(true);
            fetchQuestions().then(() => {
                setLoading(false);
                setHasFetched(true);
            });
        } else if (!user) {
            setLoading(false);
            setHasFetched(false);
            setPendingQuestions([]);
            setAnsweredQuestions([]);
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
            await fetchQuestions();
        }
    };
    const handleRejectPending = async (questionId: string) => {
        const { error } = await supabase.from('StartupQuestion').delete().eq('id', questionId);
        if (error) {
            showToast(`Smazání dotazu selhalo: ${error.message}`, 'error');
            console.error("Chyba při mazání Q&A:", error);
        } else {
            setPendingQuestions(prev => prev.filter(q => q.id !== questionId));
            showToast('Dotaz byl smazán.', 'success');
        }
    };
    const triggerDeleteAnswered = (questionId: string) => {
        setQuestionToDeleteId(questionId);
        setIsDeleteModalOpen(true);
    };
    const handleDeleteAnswered = async () => {
        if (!questionToDeleteId) return;

        const idToDelete = questionToDeleteId;
        setIsDeleteModalOpen(false); 
        setQuestionToDeleteId(null); 

        const { error } = await supabase.from('StartupQuestion').delete().eq('id', idToDelete);
        if (error) {
            showToast(`Smazání zodpovězené otázky selhalo: ${error.message}`, 'error');
            console.error("Chyba při mazání Q&A:", error);
            
        } else {
            setAnsweredQuestions(prev => prev.filter(q => q.id !== idToDelete));
            showToast('Zodpovězená otázka byla smazána.', 'success');
        }
    };

    if (loading) return <div className="text-center py-6"><LoadingSpinner/></div>;

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-xs border space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-[var(--barva-tmava)]">Čeká na odpověď ({pendingQuestions.length})</h3>
                    <div className="space-y-4 mt-4">
                        {pendingQuestions.length > 0 ? pendingQuestions.map(q => (
                            <div key={q.id} className="p-4 bg-[var(--barva-svetle-pozadi)]/70 rounded-lg border">
                                <p className="text-gray-800">{q.question_text}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <input
                                        type="text"
                                        placeholder="Napište odpověď..."
                                        className="input flex-grow !font-normal !text-sm !rounded-lg !bg-white"
                                        value={editingAnswer[q.id] || ''} 
                                        onChange={(e) => setEditingAnswer(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    />
                                    <button
                                        onClick={() => handleAnswer(q.id)}
                                        className="p-2.5 rounded-lg bg-green-400 text-white cursor-pointer hover:bg-green-500/80 transition"
                                        title="Odpovědět a zveřejnit" 
                                        disabled={!editingAnswer[q.id]?.trim()}
                                        >
                                        <Check size={16}/>
                                    </button>
                                    <button
                                        onClick={() => handleRejectPending(q.id)} 
                                        className="p-2.5 rounded-lg bg-red-400 text-white cursor-pointer hover:bg-red-500/80 transition"
                                        title="Smazat otázku" 
                                        >
                                        <Trash size={16}/>
                                    </button>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500">Žádné nové dotazy.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--barva-tmava)]">Zveřejněné dotazy ({answeredQuestions.length})</h3>
                    <div className="space-y-4 mt-4">
                        {answeredQuestions.length > 0 ? answeredQuestions.map(q => (
                            <div key={q.id} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800">{q.question_text}</p>
                                    <p className="mt-2 text-gray-600">{q.answer_text}</p>
                                </div>
                                <button
                                    onClick={() => triggerDeleteAnswered(q.id)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 transition flex-shrink-0"
                                    title="Smazat tuto otázku a odpověď"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )) : <p className="text-sm text-gray-500">Zatím žádné zveřejněné dotazy.</p> }
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAnswered}
                title="Opravdu smazat otázku?"
                message="Tato akce trvale odstraní otázku i vaši odpověď. Otázka zmizí i z vašeho veřejného profilu."
            />
        </>
    );
}