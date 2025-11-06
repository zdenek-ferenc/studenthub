"use client";

import { X, CheckCircle, PieChart, TrendingUp, FileText, Award, ShieldCheck, Star, MousePointerClick, CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const ICON_MAP: { [key: string]: React.ElementType } = {
  radar: PieChart,
  growth: TrendingUp,
  auto: FileText,
  proof: Award,
  shield: ShieldCheck,
  feedback: Star,
  click: MousePointerClick,
  check: CheckSquare,
  default: CheckCircle,
};

export const MODAL_CONTENT_MAP = {
  radar: {
    title: 'Radar dovedností',
    steps: [
      {
        icon: 'radar',
        title: 'Vizuální přehled',
        description: 'Radar graf ti okamžitě ukáže, ve kterých dovednostech jsi nejsilnější. Čím víc bodů, tím dál od středu.',
      },
      {
        icon: 'growth',
        title: 'Jak se počítá?',
        description: 'Graf se generuje automaticky z levelů, které získáváš plněním výzev. Není to jen něco, co si "naklikáš", je to reálný důkaz tvého růstu.',
      },
    ],
  },
  portfolio: {
    title: 'Dynamické portfolio',
    steps: [
      {
        icon: 'auto',
        title: 'Automatické generování',
        description: 'Každou výzvu, kterou úspěšně dokončíš, si můžeš jedním klikem přidat na svůj veřejný profil.',
      },
      {
        icon: 'proof',
        title: 'Důkaz místo slibů',
        description: 'Startupy neuvidí jen seznam dovedností, ale rovnou i projekty, na kterých jsi pracoval, včetně tvého hodnocení (9/10) a umístění (1. místo).',
      },
    ],
  },
  submission: {
    title: 'Anonymní hodnocení',
    steps: [
      {
        icon: 'shield',
        title: 'Kvalita na prvním místě',
        description: 'Startupy hodnotí odevzdaná řešení "naslepo". Vidí jen "Řešení #1", ne tvoje jméno nebo fotku. Tím je zajištěna maximální objektivita.',
      },
      {
        icon: 'feedback',
        title: 'Detailní zpětná vazba',
        description: 'Startup udělí body (1-10) a napíše slovní feedback. Tento systém ti pomůže růst a startupům dává jasné podklady pro finální výběr.',
      },
    ],
  },
  selection: {
    title: 'Finální výběr (Vizuální)',
    steps: [
      {
        icon: 'click',
        title: 'Snadné a rychlé',
        description: 'Po ohodnocení všech řešení se startupu odemkne tato obrazovka. Zde jednoduše přetáhne nejlepší řešení na stupně vítězů.',
      },
      {
        icon: 'check',
        title: 'Uzavření výzvy',
        description: 'Jakmile startup potvrdí výběr, výzva se automaticky uzavře, studentům se rozešlou notifikace, připíšou XP a vítězům se zobrazí odměny.',
      },
    ],
  },
};

type FeatureTooltipProps = {
  content: typeof MODAL_CONTENT_MAP[keyof typeof MODAL_CONTENT_MAP];
  isOpen: boolean;
  onClose: () => void;
};

export default function FeatureTooltip({ content, isOpen, onClose }: FeatureTooltipProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute top-14 right-0 z-20 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative z-10 w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-5">
              <h2 className="text-xl font-bold text-[var(--barva-tmava)]">{content.title}</h2>
              <button
                onClick={onClose}
                className="text-[var(--barva-primarni)] hover:text-[var(--barva-primarni)]/80 p-1 rounded-full hover:bg-[var(--barva-svetle-pozadi)] cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {content.steps.map((step, index) => {
                const IconComponent = ICON_MAP[step.icon] || ICON_MAP.default;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <IconComponent className="w-6 h-6 text-[var(--barva-primarni)] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}