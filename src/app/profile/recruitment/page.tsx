"use client";

import { useState } from 'react';
import withAuth from '../../../components/withAuth';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { Target, MessageSquare } from 'lucide-react';
import IdealCandidateForm from './IdealCandidateForm';
import QnaManagement from './QnaManagement';
import { motion } from 'framer-motion';

type Tab = 'candidate' | 'qna';

function RecruitmentHubPage() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('candidate');

    if (profile?.role !== 'startup') {
        return <p className="text-center py-20">Tato sekce je dostupná pouze pro startupy.</p>;
    }

    const tabs = [
        { id: 'candidate', label: 'Ideální kandidát', icon: Target },
        { id: 'qna', label: 'Správa Q&A', icon: MessageSquare }
    ];

    return (
        <div className="container mx-auto py-8 md:py-32 px-4">
            {/* --- HORNÍ ČÁST S NÁZVEM STRÁNKY --- */}
            <div className="mb-8">
                <Link href={`/profile/${profile.id}`} className="text-gray-500 hover:text-[var(--barva-primarni)] transition-colors text-sm">
                    &larr; Zpět na profil
                </Link>
                <h1 className="text-4xl font-bold text-[var(--barva-tmava)] mt-2">Centrum pro nábor</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Spravujte, jak se vaše firma prezentuje talentům. Upravte popis ideálního kandidáta a odpovídejte na dotazy studentů.</p>
            </div>

            {/* --- NOVÁ RESPONZIVNÍ NAVIGACE --- */}
            <div className="w-full">
                <nav className="flex border-b border-gray-200 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`relative flex items-center gap-2 px-4 py-3 text-sm sm:text-base font-semibold transition-colors
                                ${activeTab === tab.id ? 'text-[var(--barva-primarni)]' : ' cursor-pointer text-gray-500 hover:text-[var(--barva-tmava)]'}
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--barva-primarni)]"
                                    layoutId="underline"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* --- OBSAH PODLE ZVOLENÉ ZÁLOŽKY --- */}
                <main>
                    {activeTab === 'candidate' && <IdealCandidateForm />}
                    {activeTab === 'qna' && <QnaManagement />}
                </main>
            </div>
        </div>
    );
}

export default withAuth(RecruitmentHubPage);