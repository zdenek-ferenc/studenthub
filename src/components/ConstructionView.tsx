    "use client";

    import Link from 'next/link';
    import { motion } from 'framer-motion';
    import { ArrowLeft, HardHat, Hammer } from 'lucide-react';

    type ConstructionViewProps = {
    title: string;
    description: string;
    badgeText: string;
    icon: React.ReactNode;
    gradient: string;
    };

    export default function ConstructionView({ title, description, badgeText, icon, gradient }: ConstructionViewProps) {
    return (
        <div className="min-h-[60vh] md:min-h-[90vh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
        
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
            animate={{ 
                x: [0, 30, -20, 0],
                y: [0, -50, 20, 0],
                scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${gradient}`}
            />
            <motion.div 
            animate={{ 
                x: [0, -30, 20, 0],
                y: [0, 50, -30, 0],
                scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-200 mix-blend-multiply filter blur-3xl opacity-30"
            />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-lg w-full"
        >
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--barva-primarni)] to-transparent opacity-50"></div>

            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
            >
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--barva-primarni)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--barva-primarni)]"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-gray-500">{badgeText}</span>
            </motion.div>

            <div className="mb-6 relative inline-block">
                <div className="absolute inset-0 bg-[var(--barva-primarni)]/10 blur-xl rounded-full transform scale-150"></div>
                <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-white p-4 rounded-2xl shadow-lg text-[var(--barva-primarni)] border border-gray-100"
                >
                    {icon}
                </motion.div>
                
                <motion.div 
                    animate={{ rotate: [0, -45, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -right-2 -bottom-2 bg-[var(--barva-tmava)] text-white p-1.5 rounded-full border-2 border-white shadow-sm"
                >
                    <Hammer size={12} />
                </motion.div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--barva-tmava)] mb-4 tracking-tight">
                {title}
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                href="/"
                className="px-6 py-3 btn-shiny rounded-xl bg-[var(--barva-primarni)] text-white font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                <ArrowLeft size={18} />
                Zpět na domovskou stránku
                </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 text-sm text-gray-400 flex items-center justify-center gap-2">
                <HardHat size={14} />
                <span>RiseHigh Development Team</span>
            </div>

            </div>
        </motion.div>
        </div>
    );
    }