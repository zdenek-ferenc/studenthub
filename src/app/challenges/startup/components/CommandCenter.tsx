"use client";

import { Plus, Star, Users, ChevronDown, ClipboardList, Settings } from 'lucide-react';
import Link from 'next/link';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export type RecentSubmission = {
    anonymousId: string;
    challengeTitle: string;
    challengeId: string;
    submittedAt: string;
};

export type CommandCenterStats = {
    activeChallengesCount: number;
    unreviewedSubmissionsCount: number;
    totalApplicantsCount: number;
    recentSubmissions: RecentSubmission[];
};

const StatWidget = ({ value, label, icon: Icon }: { value: number, label: string, icon: React.ElementType }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex-1 min-w-[240px] ">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)]">{label}</h3>
            <Icon className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-5xl font-bold text-[var(--barva-primarni)] mt-4">{value}</p>
    </div>
);


export default function CommandCenter({ stats }: { stats: CommandCenterStats }) {
  return (
    <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-bold text-[var(--barva-tmava)]">Přehled výzev</h1>
            <div className="flex items-center gap-3">
                <Link href="/profile/recruitment" className="px-5 py-2.5 rounded-full bg-white border text-[var(--barva-primarni)] font-semibold shadow-sm hover:border-[var(--barva-primarni)] transition-colors flex items-center gap-2 text-sm">
                    <Settings size={16} />
                    <span>Centrum pro nábor</span>
                </Link>
                <Link href="/challenges/create" className="px-5 py-2.5 rounded-full bg-[var(--barva-primarni)] text-white font-semibold shadow-md hover:opacity-90 transition-all duration-200 flex items-center gap-2 text-sm">
                    <Plus size={18} />
                    <span>Vytvořit výzvu</span>
                </Link>
            </div>
        </div>

        <div className="flex flex-wrap gap-6">
            {/* ZMĚNA JE POUZE NA NÁSLEDUJÍCÍM ŘÁDKU: z-10 -> z-30 */}
            <Popover className="relative flex-1 min-w-[240px] z-30">
              {({ open }) => (
                <>
                  <Popover.Button 
                    disabled={stats.unreviewedSubmissionsCount === 0}
                    className={`w-full text-left bg-white p-6 rounded-2xl shadow-sm transition-all hover:shadow-md disabled:opacity-70 disabled:shadow-none ${open ? 'border-blue-500 ring-2 ring-blue-50 focus:outline-none' : 'border-gray-100 hover:border-gray-300 focus:outline-none'}`}
                  >
                      <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-[var(--barva-tmava)]">Nová řešení</h3>
                          <Star className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-5xl font-bold text-[var(--barva-primarni)] mt-4">{stats.unreviewedSubmissionsCount}</p>
                      {stats.unreviewedSubmissionsCount > 0 && (
                        <div className="mt-4 text-sm font-semibold text-gray-500 flex items-center cursor-pointer">
                            Zobrazit přehled <ChevronDown className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
                        </div>
                      )}
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 mt-3 w-screen max-w-sm transform px-4 sm:px-0">
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <div className="relative bg-white p-4 space-y-1">
                            {stats.recentSubmissions.map((sub) => (
                                <Link key={sub.challengeId + sub.anonymousId} href={`/challenges/${sub.challengeId}`} className="flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-50">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--barva-primarni2)] text-[var(--barva-primarni)]">
                                        <Star size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{sub.challengeTitle}</p>
                                        <p className="text-sm text-gray-500">Nové anonymní řešení: <strong>{sub.anonymousId}</strong></p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-4">
                            <p className="text-center text-xs text-gray-500">Zobrazeno 5 posledních řešení.</p>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            <StatWidget 
                value={stats.activeChallengesCount}
                label="Aktivní výzvy"
                icon={ClipboardList}
            />
            <StatWidget 
                value={stats.totalApplicantsCount}
                label="Celkem přihlášených"
                icon={Users}
            />
        </div>
    </div>
  );
}