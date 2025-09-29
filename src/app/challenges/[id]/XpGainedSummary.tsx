"use client";
import { Award, Sparkles, Star } from "lucide-react";

type XpEvent = {
event_type: string;
xp_gained: number;
new_level: number | null;
Skill?: { name: string };
};

const XpRow = ({ icon, label, xp, newLevel }: { icon: React.ReactNode, label: string, xp: number, newLevel: number | null }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-gray-700">{label}</span>
            {newLevel && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">LEVEL UP! &rarr; {newLevel}</span>}
        </div>
        <span className="font-bold text-green-600">+{xp} XP</span>
    </div>
);

export default function XpGainedSummary({ events }: { events: XpEvent[] }) {
    const studentXpEvent = events.find(e => e.event_type === 'student_xp');
    const skillEvents = events.filter(e => e.event_type === 'skill_xp');
    const newSkillEvents = events.filter(e => e.event_type === 'new_skill');

    return (
        <div className="bg-gray-50 p-6 rounded-2xl mt-8 border">
            <h3 className="text-xl font-bold text-center text-[var(--barva-tmava)] mb-4">Shrnutí odměn a progrese</h3>
            <div className="space-y-4 max-w-lg mx-auto">
                {studentXpEvent && (
                    <XpRow
                        icon={<Award className="w-6 h-6 text-blue-500" />}
                        label="Celkový pokrok"
                        xp={studentXpEvent.xp_gained}
                        newLevel={studentXpEvent.new_level}
                    />
                )}
                {skillEvents.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-600 mb-2 ml-1">Vylepšené dovednosti:</h4>
                        <div className="space-y-2">
                            {skillEvents.map((event, i) => (
                                <XpRow
                                    key={`skill-${i}`}
                                    icon={<Star className="w-6 h-6 text-amber-500" />}
                                    label={event.Skill?.name || 'Dovednost'}
                                    xp={event.xp_gained}
                                    newLevel={event.new_level}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {newSkillEvents.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-green-700 mb-2 ml-1">Nové dovednosti odemčeny!</h4>
                        <div className="space-y-2">
                            {newSkillEvents.map((event, i) => (
                                <XpRow
                                    key={`new-skill-${i}`}
                                    icon={<Sparkles className="w-6 h-6 text-green-600" />}
                                    label={event.Skill?.name || 'Nová dovednost'}
                                    xp={event.xp_gained}
                                    newLevel={event.new_level}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}