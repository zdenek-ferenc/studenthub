"use client";

import { useEffect, useState, useRef, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import ConfirmationModal from '../../../../components/ConfirmationModal';

type StudentProfile = { full_name?: string };
type Question = {
id: string;
challenge_id: string;
student_id: string;
question_text: string;
answer_text?: string | null;
is_pinned?: boolean;
created_at: string;
answered_at?: string | null;
StudentProfile?: StudentProfile | null;
};

export default function ChallengeQnA({ challengeId, role, onAnswered, visible }: { challengeId: string; role: 'student' | 'startup'; onAnswered?: () => void; visible?: boolean }) {
const { user, showToast } = useAuth();
const [questions, setQuestions] = useState<Question[]>([]);
const [myQuestions, setMyQuestions] = useState<Question[]>([]);
const [newQuestion, setNewQuestion] = useState<string>('');
const [loading, setLoading] = useState<boolean>(true);
const initialLoadedRef = useRef<boolean>(false);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [backgroundLoading, setBackgroundLoading] = useState<boolean>(false);
const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
const [pendingAnswer, setPendingAnswer] = useState<{ questionId: string; answerText: string; isPinned: boolean } | null>(null);
    const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});
    const visibleItemsRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        visibleItemsRef.current = visibleItems;
    }, [visibleItems]);
    const timersRef = useRef<number[]>([]);
    const questionsRef = useRef<Question[]>([]);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

useEffect(() => {
    if (!challengeId) return;
    
    if (typeof window !== 'undefined') {
        try {
            const raw = window.sessionStorage.getItem(`challenge_qna_${challengeId}`);
            if (raw) {
                const parsed = JSON.parse(raw) as Question[];
                if (parsed && parsed.length > 0) {
                    setQuestions(parsed);
                    questionsRef.current = parsed;
                    initialLoadedRef.current = true;
                    setLoading(false);
                    
                    const vis: Record<string, boolean> = {};
                    parsed.forEach(p => vis[p.id] = true);
                    setVisibleItems(vis);
                }
            }
        } catch {
            
        }
    }

        const fetchQuestions = async (opts?: { background?: boolean }) => {
            const isBackground = !!opts?.background;
            const isInitial = !initialLoadedRef.current;
            
            if (!isBackground && isInitial) setLoading(true);

            try {
                
                if (isBackground || questionsRef.current.length > 0) {
                    const latest = questionsRef.current.length > 0
                        ? questionsRef.current.reduce((max, q) => q.created_at > max ? q.created_at : max, questionsRef.current[0].created_at || '')
                        : '';
                    const { data, error } = await supabase
                        .from('ChallengeQuestion')
                        .select('*, StudentProfile(*)')
                        .eq('challenge_id', challengeId)
                        .gt('created_at', latest)
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error('Error fetching new questions', error);
                    } else {
                        const newItems = (data || []) as Question[];
                        if (newItems.length > 0) {
                            
                            setQuestions(prev => {
                                const merged = [...newItems, ...prev];
                                try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(merged)); } catch {};
                                return merged;
                            });
                            if (user) setMyQuestions(prev => [...newItems.filter(q => q.student_id === user.id), ...prev]);
                        }
                    }
                } else {
                    const { data, error } = await supabase
                        .from('ChallengeQuestion')
                        .select('*, StudentProfile(*)')
                        .eq('challenge_id', challengeId)
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error('Error fetching questions', error);
                    } else {
                        const arr = (data || []) as Question[];
                        setQuestions(arr);
                        try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(arr)); } catch {};
                        if (user) setMyQuestions(arr.filter(q => q.student_id === user.id));
                    }
                }
                } finally {
                    if (!isBackground) setLoading(false);
                    if (!initialLoadedRef.current) {
                        initialLoadedRef.current = true;
                    }
                }
        };

        void fetchQuestions();

        const channel = supabase.channel(`public:challenge_questions_${challengeId}`);

        
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ChallengeQuestion', filter: `challenge_id=eq.${challengeId}` }, () => {
            void fetchQuestions({ background: true });
        });

        
            channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ChallengeQuestion', filter: `challenge_id=eq.${challengeId}` }, (payload: { new?: Partial<Question> }) => {
            const newRow = payload?.new as Question | undefined;
            if (!newRow) return;

            setQuestions(prev => {
                const exists = prev.find(p => p.id === newRow.id);
                if (exists) {
                    const updated = prev.map(p => p.id === newRow.id ? { ...p, ...newRow } : p);
                    try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(updated)); } catch {}
                        setMyQuestions(prevMy => prevMy.map(p => p.id === newRow.id ? { ...p, ...newRow } : p));
                    return updated;
                }
                const merged = [newRow, ...prev];
                try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(merged)); } catch {}
                    setMyQuestions(prevMy => newRow && user && newRow.student_id === user.id ? [{ ...newRow as Question }, ...prevMy] : prevMy);
                return merged;
            });

            if (newRow.answer_text && user && user.id === newRow.student_id) {
                if (showToast) showToast('Na vaši otázku odpověděl startup.', 'success');
            }
        });

        channel.subscribe();

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                void fetchQuestions({ background: true });
            }
        };

        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            channel.unsubscribe();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [challengeId, user, showToast]);

        useEffect(() => {
            timersRef.current.forEach(t => clearTimeout(t));
            timersRef.current = [];

            if (!visible) {
                return;
            }

            const ids = questions.map(q => q.id);
            const idsToAnimate = ids.filter(id => !visibleItemsRef.current[id]);
            if (idsToAnimate.length === 0) return;

            setVisibleItems(prev => {
                const next = { ...prev };
                idsToAnimate.forEach(id => { next[id] = false; });
                return next;
            });

            idsToAnimate.forEach((id, idx) => {
                const t = window.setTimeout(() => {
                    setVisibleItems(prev => ({ ...prev, [id]: true }));
                }, idx * 60);
                timersRef.current.push(t);
            });

            return () => {
                timersRef.current.forEach(t => clearTimeout(t));
                timersRef.current = [];
            };
        }, [visible, questions]);

const handleAsk = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
    if (showToast) showToast('Pro odeslání se musíš přihlásit.', 'error');
    return;
    }
    if (!newQuestion.trim()) return;

    const { data, error } = await supabase.from('ChallengeQuestion').insert({
    challenge_id: challengeId,
    student_id: user.id,
    question_text: newQuestion.trim(),
    }).select('*').single();

    if (error) {
    console.error('Error inserting question', error);
    if (showToast) showToast('Chyba při odesílání otázky.', 'error');
    } else if (data) {
    setNewQuestion('');
    try {
        const { data: chal } = await supabase.from('Challenge').select('startup_id, title').eq('id', challengeId).single();
        if (chal?.startup_id) {
        await supabase.from('notifications').insert({
            user_id: chal.startup_id,
            message: `Student položil otázku k výzvě: ${chal.title || ''}`,
            link_url: `/challenges/${challengeId}`,
        });
        }
    } catch (err) {
        console.warn('Could not notify startup client-side', err);
    }
    setQuestions(prev => [data, ...prev]);
    setMyQuestions(prev => [data, ...prev]);
    try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify([data, ...questionsRef.current])); } catch {}
    }
};

if (loading && questions.length === 0) return <p className="text-center py-8">Načítám dotazy...</p>;

if (role === 'student') {
    return (
    <div className="bg-white p-6 rounded-2xl shadow-xs">
        <form onSubmit={handleAsk} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Položit otázku</label>
        <textarea value={newQuestion} placeholder="..."onChange={e => setNewQuestion(e.target.value)} className="w-full text-[var(--barva-tmava)] focus:outline-1 focus:outline-[var(--barva-primarni)]/50 p-3 resize-none border-2 border-gray-100 shadow-xs rounded-xl" rows={3} />
        <div className="flex justify-end">
            <button type="submit" className="px-5 transition-all ease-in-out duration-200 hover:opacity-90 cursor-pointer py-2 bg-[var(--barva-primarni)] text-white rounded-full">Odeslat</button>
        </div>
        </form>

        <div className="mt-6">
        <h4 className="font-semibold text-[var(--barva-primarni)] mb-2">Moje otázky</h4>
        {myQuestions.length === 0 ? <p className="text-sm text-gray-500">Zatím žádné otázky.</p> : (
            <ul className="space-y-3">
                {questions.map(q => (
                <li key={q.id} className={`p-4 border-2 border-gray-100 shadow-xs rounded-xl bg-white transform transition-all duration-300 ease-out ${(visibleItems[q.id] ?? true) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${!q.answer_text ? '' : ''}`}>
                    <div className="text-sm text-gray-800">{q.question_text}</div>
                    <div className="text-xs text-[var(--barva-tmava)] mt-2">{q.answered_at ? `` : 'Čeká na odpověď'}</div>
                    {q.answer_text && <div className="mt-2 p-3 bg-gray-50 text-[var(--barva-tmava)] rounded">{q.answer_text}</div>}
                    </li>
                ))}
            </ul>
        )}
        </div>

        <div className="mt-6">
        <h4 className="font-semibold text-[var(--barva-primarni)] mb-2">Veřejné otázky</h4>
        {questions.filter(q => q.is_pinned).length === 0 ? <p className="text-sm text-gray-500">Žádné veřejné otázky.</p> : (
            <ul className="space-y-3">
                {questions.filter(q => q.is_pinned).map(q => (
                    <li key={q.id} className={`p-3 border-2 border-gray-100 shadow-xs rounded-xl transform transition-all duration-300 ease-out ${(visibleItems[q.id] ?? true) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${!q.answer_text ? '' : ''}`}>
                <div className="text-sm text-gray-800">{q.question_text}</div>
                {q.answer_text ? <div className="mt-2 p-3 bg-gray-50 text-[var(--barva-tmava)] rounded">{q.answer_text}</div> : <div className="mt-2 text-xs text-gray-500">Čeká na odpověď</div>}
                </li>
            ))}
            </ul>
        )}
        </div>
    </div>
    );
}

return (
    <div className="space-y-4">
    {questions.length === 0 ? <p className="text-sm text-gray-500">Zatím žádné dotazy.</p> : (
        <ul className="space-y-4">
            {questions.map(q => (
            <li key={q.id} className={`p-4 border-2 border-gray-100 rounded-xl bg-white transform transition-all duration-300 ease-out ${(visibleItems[q.id] ?? true) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${!q.answer_text ? '' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                <div className="text-lg text-gray-700 mt-1">{q.question_text}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(q.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-3">
                <textarea id={`answer_${q.id}`} className="w-full p-2 border-2 shadow-xs border-gray-100 text-[var(--barva-tmava)] resize-none rounded-md" defaultValue={q.answer_text || ''} rows={3} disabled={!!q.answer_text}></textarea>
                <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input id={`pin_${q.id}`} type="checkbox" className="sr-only text-[var(--barva-tmava)] peer" checked={!!q.is_pinned} onChange={async (e) => {
                                        const newVal = e.target.checked;
                                        setQuestions(prev => {
                                            const updated = prev.map(p => p.id === q.id ? { ...p, is_pinned: newVal } : p);
                                            try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(updated)); } catch {}
                                            return updated;
                                        });
                                        try {
                                            const res = await fetch('/api/challenges/answer-question', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ questionId: q.id, is_pinned: newVal, challengeId })
                                            });
                                            if (!res.ok) {
                                                const txt = await res.text();
                                                throw new Error(txt || 'Server error');
                                            }
                                        } catch (err) {
                                            console.error('Failed to update pin', err);
                                            setQuestions(prev => {
                                                const reverted = prev.map(p => p.id === q.id ? { ...p, is_pinned: !!q.is_pinned } : p);
                                                try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(reverted)); } catch {}
                                                return reverted;
                                            });
                                            if (showToast) showToast('Chyba při aktualizaci viditelnosti', 'error');
                                        }
                                    }} />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[var(--barva-primarni)] relative transition-colors after:content-[''] after:absolute after:left-1 after:top-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-5"></div>
                                    <span className="select-none text-[var(--barva-tmava)]">Zveřejnit pro všechny</span>
                                </label>

                                <button onClick={() => {
                                    const answerEl = document.getElementById(`answer_${q.id}`) as HTMLTextAreaElement | null;
                                    const pinEl = document.getElementById(`pin_${q.id}`) as HTMLInputElement | null;
                                    const answerText = answerEl?.value || '';
                                    const isPinned = pinEl?.checked || false;
                                    setPendingAnswer({ questionId: q.id, answerText, isPinned });
                                    setConfirmOpen(true);
                                }} className={`px-4 py-2 rounded-full cursor-pointer transition-all ease-in-out hover:opacity-90 duration-300 ${q.answer_text ? 'opacity-0 pointer-events-none translate-y-2' : 'bg-[var(--barva-primarni)] text-white'}`} aria-hidden={!!q.answer_text}>{q.answer_text ? '' : 'Odpovědět'}</button>
                </div>
            </div>
            </li>
        ))}
        </ul>
    )}
        <ConfirmationModal
            isOpen={confirmOpen}
            onClose={() => { setConfirmOpen(false); setPendingAnswer(null); }}
            onConfirm={async () => {
                if (!pendingAnswer) return;
                const { questionId, answerText, isPinned } = pendingAnswer;
                try {
                    const res = await fetch('/api/challenges/answer-question', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questionId, answer_text: answerText, is_pinned: isPinned, challengeId })
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || 'Server error');
                    }
                    setQuestions(prev => {
                        const updated = prev.map(p => p.id === questionId ? { ...p, answer_text: answerText, is_pinned: isPinned, answered_at: new Date().toISOString() } : p);
                        try { if (typeof window !== 'undefined') window.sessionStorage.setItem(`challenge_qna_${challengeId}`, JSON.stringify(updated)); } catch {}
                        return updated;
                    });
                    if (showToast) showToast('Odpověď odeslána a zamčena', 'success');
                    if (onAnswered) onAnswered();
                } catch (err) {
                    console.error(err);
                    if (showToast) showToast('Chyba při odesílání odpovědi', 'error');
                } finally {
                    setConfirmOpen(false);
                    setPendingAnswer(null);
                }
            }}
            title="Potvrď odpověď"
            message="Odpověď bude trvale uzamčena a nebude možné ji později měnit. Jsi si jistý/á?"
        />
    </div>
);
}
