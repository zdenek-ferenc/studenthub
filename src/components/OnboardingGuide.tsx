"use client";

import { useState, useEffect } from 'react';
import { useOnboardingState, OnboardingTask } from '@/hooks/useOnboardingState';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ChevronDown, Rocket, PartyPopper, Trophy } from 'lucide-react';


const SuccessView = ({ onClose }: { onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-[320px] bg-gradient-to-br from-[var(--barva-primarni)] to-[var(--barva-tmava)] rounded-2xl shadow-2xl border border-amber-200 overflow-hidden p-6 text-center relative"
        >
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-10 -left-10 text-blue-900"
                ><PartyPopper size={120} /></motion.div>
                <motion.div 
                    animate={{ rotate: -360, scale: [1, 1.2, 1]  }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-10 -right-10 text-blue-400"
                ><PartyPopper size={100} /></motion.div>
            </div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-[var(--barva-primarni)] relative z-10"
            >
                <Trophy size={40} />
            </motion.div>
            
            <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-bold text-xl text-white mb-2 relative z-10"
            >
                Skvělá práce!
            </motion.h3>
            <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-200 text-sm mb-6 relative z-10"
            >
                Tvůj profil je kompletní. Jsi připraven zazářit před startupy.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="bg-[var(--barva-primarni)] hover:bg-[var(--barva-primarni)]/70 cursor-pointer text-white font-semibold py-2 px-6 rounded-full text-sm transition-colors shadow-md relative z-10"
            >
                Díky, zavřít
            </motion.button>
        </motion.div>
    );
};

const CircularProgress = ({ percent, onClick }: { percent: number; onClick: () => void }) => {
  const circumference = 2 * Math.PI * 18; 
  const strokeDashoffset = circumference - (percent / 100) * circumference;

return (
    <button 
        onClick={onClick}
        className="relative group w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
    >
    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
        <circle
        cx="22" cy="22" r="18" fill="none" stroke="var(--barva-primarni)" strokeWidth="4"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--barva-tmava)]">
        {Math.round(percent)}%
    </div>
    </button>
);
};

const TaskItem = ({ task }: { task: OnboardingTask }) => {
    const Icon = task.icon;
    return (
        <Link href={task.href} className={`block group relative overflow-hidden rounded-xl border transition-all duration-200 ${
            task.isCompleted 
                ? 'bg-gray-50 border-gray-100 opacity-60' 
                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer'
        }`}>
            <div className="flex items-center gap-3 p-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-[var(--barva-primarni)]'
                }`}>
                    {task.isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {task.title}
                    </p>
                    {!task.isCompleted && (
                        <p className="text-xs text-gray-500 truncate">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>
            {!task.isCompleted && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[var(--barva-primarni)] transition-opacity">
                    <ChevronDown className="-rotate-90" size={16}/>
                </div>
            )}
        </Link>
    );
};

export default function OnboardingGuide() {
    const {
        isVisible,
        tasks,
        progressPercent,
        completedCount,
        totalTasks,
        showCelebration 
    } = useOnboardingState();

    const [isOpen, setIsOpen] = useState(false);
    const [celebrationDismissed, setCelebrationDismissed] = useState(false);

    useEffect(() => {
        if (isVisible && progressPercent === 0 && !localStorage.getItem('guide_closed') && !showCelebration) {
            setIsOpen(true);
        }
    }, [isVisible, progressPercent, showCelebration]);

    const handleClose = () => {
        setIsOpen(false);
        setCelebrationDismissed(true); 
        localStorage.setItem('guide_closed', 'true');
    };

    useEffect(() => {
        if (showCelebration) setIsOpen(false);
    }, [showCelebration]);


    if (!isVisible) return null;

    return (
        <div className="fixed right-4 z-50 bottom-24 md:bottom-6 w-auto h-auto">
            <div className="relative flex items-end justify-end">
                <AnimatePresence mode="wait">
                    {showCelebration && !celebrationDismissed && (
                        <motion.div
                            key="celebration"
                            className="absolute bottom-0 right-0 origin-bottom-right" 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        >
                            <SuccessView onClose={handleClose} />
                        </motion.div>
                    )}

                    {isOpen && !showCelebration && (
                        <motion.div
                            key="list"
                            className="absolute bottom-0 right-0 origin-bottom-right" 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                        >
                            <div className="w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-[var(--barva-primarni)] to-[var(--barva-tmava)] p-5 text-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                Startovní čára <Rocket size={18} />
                                            </h3>
                                            <p className="text-blue-100 text-xs">Nastartuj svou kariéru naplno.</p>
                                        </div>
                                        <button onClick={handleClose} className="text-white/80 hover:text-white cursor-pointer">
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs font-semibold mb-1.5 opacity-90">
                                            <span>{Math.round(progressPercent)}% Hotovo</span>
                                            <span>{completedCount}/{totalTasks}</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                                            <motion.div 
                                                className="bg-white h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 space-y-2 bg-gray-50/50 max-h-[300px] overflow-y-auto">
                                    {tasks.map(task => (
                                        <TaskItem key={task.id} task={task} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!isOpen && !showCelebration && (
                        <motion.div
                            key="button"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <CircularProgress 
                                percent={progressPercent} 
                                onClick={() => setIsOpen(true)} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}