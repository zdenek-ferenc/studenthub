"use client";

import { useState } from 'react';
import { useOnboardingState, OnboardingTask } from '@/hooks/useOnboardingState';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';

const ProgressBar = ({ percent }: { percent: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
            className="h-2 rounded-full bg-[var(--barva-primarni)]"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
    </div>
);

const TaskItem = ({ task, isCurrent }: { task: OnboardingTask, isCurrent: boolean }) => {
    const Icon = task.icon;
    const content = (
        <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${isCurrent ? 'bg-[var(--barva-primarni2)] text-[var(--barva-primarni)]' : 'bg-gray-200 text-gray-500'}
                ${task.isCompleted ? 'bg-green-100 text-green-600' : ''}
            `}>
                {task.isCompleted ? <Check size={18} /> : <Icon size={18} />}
            </div>
            <div className="flex-1">
                <p className={`font-semibold text-sm transition-colors ${isCurrent ? 'text-[var(--barva-tmava)]' : 'text-gray-500'}`}>
                    {task.title}
                </p>
                {isCurrent && (
                    <p className="text-xs text-gray-500">
                        {task.description}
                    </p>
                )}
            </div>
        </div>
    );

    if (isCurrent && !task.isCompleted) {
        return (
            <Link href={task.href} className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                {content}
            </Link>
        );
    }

    return (
        <div className="p-3 rounded-lg opacity-70">
            {content}
        </div>
    );
};


export default function OnboardingGuide() {
    const {
        isVisible,
        tasks,
        activeTask,
        progressPercent,
        completedCount,
        totalTasks
    } = useOnboardingState();

    const [isOpen, setIsOpen] = useState(true);


    if (!isVisible) {
        return null;
    }

    const handleToggle = () => setIsOpen(prev => !prev);

    return (
        <div className="fixed bottom-4 right-4 z-40 w-[320px]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                        <header className="p-4 border-b border-gray-100">
                            <div className="flex items-center mb-2">
                                <h3 className="font-bold text-base text-[var(--barva-tmava)]">Průvodce startem</h3>
                            </div>
                            <p className="text-sm text-gray-500">
                                {completedCount} z {totalTasks} kroků hotovo
                            </p>
                            <div className="mt-2">
                                <ProgressBar percent={progressPercent} />
                            </div>
                        </header>
                        <div className="p-2">
                            {tasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    isCurrent={task.id === activeTask?.id}
                                />
                            ))}
                        </div>
                        <footer
                            onClick={handleToggle}
                            className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        >
                            Skrýt
                        </footer>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleToggle}
                        className="w-16 h-16 rounded-full bg-[var(--barva-primarni)] text-white shadow-lg flex items-center justify-center"
                        title="Zobrazit průvodce"
                    >
                        <div className="relative w-10 h-10">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#CEE8FF"
                                    strokeWidth="3"
                                />
                                <motion.path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${progressPercent}, 100`}
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - progressPercent }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                                {Math.round(progressPercent)}%
                            </div>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}