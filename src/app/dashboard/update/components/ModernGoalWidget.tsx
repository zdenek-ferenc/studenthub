"use client";

import { useState, useEffect } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { Target, Edit3, Save, Trophy, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModernGoalWidget() {
    const { stats } = useDashboard();
    const [isEditing, setIsEditing] = useState(false);
    const [goalName, setGoalName] = useState('Nový MacBook 💻');
    const [goalAmount, setGoalAmount] = useState(35000);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedName = localStorage.getItem('rh_goal_name');
        const savedAmount = localStorage.getItem('rh_goal_amount');
        if (savedName) setGoalName(savedName);
        if (savedAmount) setGoalAmount(parseInt(savedAmount));
    }, []);

    const handleSave = () => {
        localStorage.setItem('rh_goal_name', goalName);
        localStorage.setItem('rh_goal_amount', goalAmount.toString());
        setIsEditing(false);
    };

    if (!mounted) return null; 

    const currentEarnings = stats?.totalEarnings || 0;
    const percentage = Math.min(100, Math.max(0, (currentEarnings / goalAmount) * 100));
    const remaining = Math.max(0, goalAmount - currentEarnings);
    const isCompleted = currentEarnings >= goalAmount;

    const challengesLeft = Math.ceil(remaining / 5000);

    return (
        <div className="bg-gradient-to-br from-[#0B1623]/90 to-[#1a2c42]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-full relative overflow-hidden group">    
            <div className={`absolute top-[-20%] right-[-20%] w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full transition-opacity duration-1000 ${isCompleted ? 'opacity-100 bg-yellow-500/30' : 'opacity-30'}`}></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'} border border-white/5`}>
                        {isCompleted ? <Trophy size={18} /> : <Target size={18} />}
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">Můj Cíl</h3>
                </div>
                <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-3 relative z-10 animate-fade-in-up">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Na co šetříš?</label>
                        <input 
                            type="text" 
                            value={goalName} 
                            onChange={(e) => setGoalName(e.target.value)}
                            className="w-full bg-[#001224] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors"
                            placeholder="Např. Dovolená"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Cílová částka (Kč)</label>
                        <input 
                            type="number" 
                            value={goalAmount} 
                            onChange={(e) => setGoalAmount(Number(e.target.value))}
                            className="w-full bg-[#001224] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors"
                        />
                    </div>
                    <button onClick={handleSave} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors">
                        Uložit cíl
                    </button>
                </div>
            ) : (
                <div className="relative z-10">
                    <div className="mb-4">
                        <h4 className="text-xl font-bold text-white mb-1 truncate">{goalName}</h4>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tabular-nums">
                                {currentEarnings.toLocaleString('cs-CZ')}
                            </span>
                            <span className="text-sm text-gray-500 font-medium mb-1">
                                / {goalAmount.toLocaleString('cs-CZ')} Kč
                            </span>
                        </div>
                    </div>

                    <div className="relative w-full h-3 bg-[#001224] rounded-full overflow-hidden mb-3 border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${percentage}%` }} 
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full relative ${isCompleted ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-purple-600 to-blue-500'}`}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/30 blur-[5px] skew-x-[-20deg] animate-shimmer"></div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{Math.round(percentage)}% Hotovo</span>
                        
                        {!isCompleted ? (
                            <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                <Gift size={12} className="text-purple-400"/>
                                <span>~ {challengesLeft} výzvy do cíle</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20 animate-pulse">
                                <Sparkles size={12} />
                                <span>Cíl splněn! Gratulujeme!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}