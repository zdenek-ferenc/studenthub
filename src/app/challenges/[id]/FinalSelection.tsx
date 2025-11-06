"use client";

import { useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react';
import type { Submission } from './SubmissionCard';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, ThumbsDown, ArrowLeft } from 'lucide-react';

type AnonymousSubmission = Submission & { anonymousId: string };
type ChallengeForWinners = { 
    reward_first_place: number | null; 
    reward_second_place: number | null; 
    reward_third_place: number | null; 
    number_of_winners: number | null; 
};
type ContainerId = 'shortlist' | 'place1' | 'place2' | 'place3';

const FinalistItem = ({ submission, isOverlay = false }: { submission: AnonymousSubmission, isOverlay?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border ${isOverlay ? 'shadow-lg scale-105' : ''}`}>
        <div className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-grow">
            <p className="font-bold text-gray-800 text-sm">{submission.anonymousId}</p>
        </div>
        <div className="flex items-center gap-1 font-bold text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
            <Star size={14} />
            <span>{submission.rating}/10</span>
        </div>
    </div>
);

const SortableFinalistItem = ({ submission }: { submission: AnonymousSubmission }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: submission.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return <div ref={setNodeRef} style={style} {...attributes} {...listeners}><FinalistItem submission={submission} /></div>;
};

const WinnerDropzone = ({ place, submission, reward }: { place: 1 | 2 | 3, submission: AnonymousSubmission | null, reward: number | null }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `place${place}` });
    const placeColors = { 1: "border-amber-400 bg-amber-50", 2: "border-slate-400 bg-slate-50", 3: "border-orange-600 bg-orange-50" };
    const items = submission ? [submission.id] : [];
    return (
        <div ref={setNodeRef} className={`p-4 rounded-2xl border-2 border-dashed h-28 flex flex-col justify-center items-center transition-colors ${placeColors[place]} ${isOver ? 'bg-opacity-50 scale-[1.02]' : ''}`}>
            <p className="font-bold text-lg text-gray-700">{place}. Místo</p>
            {/* Zobrazíme odměnu, jen pokud je finanční */}
            {reward ? <p className="text-sm text-gray-500 mb-2">{reward} Kč</p> : <p className="text-sm text-gray-500 mb-2">Nefinanční odměna</p>}
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="w-full px-2">{submission && <SortableFinalistItem submission={submission} />}</div>
            </SortableContext>
        </div>
    );
};

export default function FinalSelection({ submissions, challenge, onFinalize, onBack }: { submissions: AnonymousSubmission[], challenge: ChallengeForWinners, onFinalize: (winners: { [key: number]: string }) => void, onBack: () => void }) {
    const [shortlist, setShortlist] = useState<AnonymousSubmission[]>([]);
    const [place1, setPlace1] = useState<AnonymousSubmission[]>([]);
    const [place2, setPlace2] = useState<AnonymousSubmission[]>([]);
    const [place3, setPlace3] = useState<AnonymousSubmission[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showLowRated, setShowLowRated] = useState(false);

    useEffect(() => {
        const placedIds = [...place1, ...place2, ...place3].map(p => p.id);
        const unplaced = submissions.filter(s => !placedIds.includes(s.id));
        setShortlist(unplaced.sort((a, b) => (b.rating || 0) - (a.rating || 0)));
    }, [submissions, place1, place2, place3]);
    
    const winnerSlots = useMemo(() => {
        const slots: (1 | 2 | 3)[] = [];
        if (challenge.reward_first_place !== null) slots.push(1);
        if (challenge.reward_second_place !== null) slots.push(2);
        if (challenge.reward_third_place !== null) slots.push(3);

        // Pokud není finanční a máme počet vítězů, použijeme ten
        if (slots.length === 0 && challenge.number_of_winners) {
            for (let i = 1; i <= challenge.number_of_winners; i++) {
                slots.push(i as 1 | 2 | 3);
            }
        }
        if (slots.length === 0) {
            return [1];
        }

        return slots;
    }, [challenge]);
    
    const findContainer = (id: string): ContainerId | undefined => {
        if (place1.some(item => item.id === id)) return 'place1';
        if (place2.some(item => item.id === id)) return 'place2';
        if (place3.some(item => item.id === id)) return 'place3';
        if (shortlist.some(item => item.id === id)) return 'shortlist';
        return undefined;
    };
    
    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id.toString());

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();
        
        const activeContainer = findContainer(activeIdStr);
        let overContainer: ContainerId | undefined = findContainer(overIdStr);
        if (!overContainer) {
            if (overIdStr === 'place1' || overIdStr === 'place2' || overIdStr === 'place3' || overIdStr === 'shortlist') {
                overContainer = overIdStr as ContainerId;
            }
        }

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            if (activeContainer === 'shortlist' && activeIdStr !== overIdStr) {
                const oldIndex = shortlist.findIndex(item => item.id === activeIdStr);
                const newIndex = shortlist.findIndex(item => item.id === overIdStr);
                if (oldIndex !== -1 && newIndex !== -1) {
                    setShortlist(arrayMove(shortlist, oldIndex, newIndex));
                }
            }
            return;
        }

        const containers: { [key in ContainerId]: AnonymousSubmission[] } = { shortlist, place1, place2, place3 };
        const setters: { [key in ContainerId]: Dispatch<SetStateAction<AnonymousSubmission[]>> } = { shortlist: setShortlist, place1: setPlace1, place2: setPlace2, place3: setPlace3 };

        const activeItem = submissions.find(s => s.id === activeIdStr);
        if (!activeItem) return;
        const newActiveItems = containers[activeContainer].filter(item => item.id !== activeIdStr);
        const newOverItems = [...containers[overContainer]];
        let itemToSwap: AnonymousSubmission | undefined = undefined;
        if (overContainer.startsWith('place') && newOverItems.length > 0) {
            itemToSwap = newOverItems.pop();
        }
        newOverItems.push(activeItem);
        setters[activeContainer](newActiveItems);
        setters[overContainer](newOverItems);
        if (itemToSwap) {
            setShortlist(current => [...current, itemToSwap!].sort((a, b) => (b.rating || 0) - (a.rating || 0)));
        }
    };
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const activeSubmission = activeId ? submissions.find(s => s.id === activeId) : null;    
    const handleFinalizeClick = () => {
        const winnerIds: { [key: number]: string } = {};
        if (place1[0]) winnerIds[1] = place1[0].id;
        if (place2[0]) winnerIds[2] = place2[0].id;
        if (place3[0]) winnerIds[3] = place3[0].id;
        onFinalize(winnerIds);
    };

    const allSlotsFilled = winnerSlots.every(place => (place === 1 ? place1 : place === 2 ? place2 : place3).length > 0);
    const displayedShortlist = showLowRated ? shortlist : shortlist.filter(s => (s.rating || 0) >= 5);
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="text-center mb-8">
                <button onClick={onBack} className="pb-2 text-sm text-[var(--barva-tmava)] hover:text-[var(--barva-primarni)] transition-all ease-in-out duration-200 cursor-pointer flex items-center gap-1 mx-auto">
                    <ArrowLeft size={14} /> Zpět na hodnocení
                </button>
                <h2 className="text-3xl font-bold text-center text-[var(--barva-tmava)] mt-2">Finální výběr vítězů</h2>
                <p className="text-center text-gray-600 text-lg mt-2">Přetáhněte nejlepší řešení z finalistů na vítězné pozice.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-700">Finalisté ({displayedShortlist.length})</h4>
                        <button onClick={() => setShowLowRated(!showLowRated)} className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 transition-all ease-in-out duration-200 flex items-center gap-1">
                            <ThumbsDown size={14} /> {showLowRated ? 'Skrýt' : 'Zobrazit'} řešení s nízkým hodnocením
                        </button>
                    </div>
                    <SortableContext items={shortlist.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[200px] max-h-[500px] overflow-y-auto pr-2">
                            {displayedShortlist.map(sub => <SortableFinalistItem key={sub.id} submission={sub} />)}
                        </div>
                    </SortableContext>
                </div>
                <div className="lg:col-span-1 grid grid-cols-1 gap-4">
                    {winnerSlots.includes(1) && <WinnerDropzone place={1} submission={place1[0] || null} reward={challenge.reward_first_place} />}
                    {winnerSlots.includes(2) && <WinnerDropzone place={2} submission={place2[0] || null} reward={challenge.reward_second_place} />}
                    {winnerSlots.includes(3) && <WinnerDropzone place={3} submission={place3[0] || null} reward={challenge.reward_third_place} />}
                </div>
            </div>
            <div className="text-center mt-10">
                <button onClick={handleFinalizeClick} disabled={!allSlotsFilled} className="px-8 py-3 rounded-full bg-[var(--barva-primarni)] text-white font-bold text-lg shadow-lg hover:bg-[var(--barva-primarni)]/90 cursor-pointer transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {allSlotsFilled ? 'Vyhlásit výsledky a uzavřít výzvu' : `Obsaďte všechny pozice (${winnerSlots.length})`}
                </button>
            </div>
            <DragOverlay>{activeSubmission && <FinalistItem submission={activeSubmission} isOverlay />}</DragOverlay>
        </DndContext>
    );
}