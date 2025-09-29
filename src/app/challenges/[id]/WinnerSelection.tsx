"use client";

import { useState, useMemo } from 'react';
import type { Submission } from './SubmissionCard';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User } from 'lucide-react';

type AnonymousSubmission = Submission & { anonymousId: string };

type ChallengeForWinners = {
    reward_first_place: number | null;
    reward_second_place: number | null;
    reward_third_place: number | null;
};

type ContainerId = 'candidates' | 'place1' | 'place2' | 'place3';

type Containers = {
    [key in ContainerId]: AnonymousSubmission[];
};

const SubmissionItem = ({ submission }: { submission: AnonymousSubmission }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 text-sm">
                <User size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-800 text-sm">{submission.anonymousId}</p>
                <p className="text-xs text-gray-500">Hodnocení: {submission.rating}/10</p>
            </div>
        </div>
    );
};

const SortableSubmissionItem = ({ submission }: { submission: AnonymousSubmission }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: submission.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <SubmissionItem submission={submission} />
        </div>
    );
};

const WinnerDropzone = ({ place, submission }: { place: 1 | 2 | 3, submission: AnonymousSubmission | null }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `place-${place}` });
    const placeColors: { [key: number]: string } = { 1: "border-amber-400 bg-amber-50", 2: "border-slate-400 bg-slate-50", 3: "border-orange-600 bg-orange-50" };
    const placeText: { [key: number]: string } = { 1: "1. Místo", 2: "2. Místo", 3: "3. Místo" };

    return (
        <div ref={setNodeRef} className={`p-4 rounded-2xl border-2 border-dashed h-32 flex flex-col justify-center items-center transition-colors ${placeColors[place]} ${isOver ? 'bg-opacity-50 scale-[1.02]' : ''}`}>
            <p className="font-bold text-lg text-gray-700 mb-2">{placeText[place]}</p>
            <div className="min-h-[58px] flex items-center justify-center">
                {submission ? (
                    <SortableContext items={[submission.id]} strategy={verticalListSortingStrategy}>
                        <SortableSubmissionItem submission={submission} />
                    </SortableContext>
                ) : (
                    <p className="text-sm text-gray-500">Přetáhněte sem</p>
                )}
            </div>
        </div>
    );
};

export default function WinnerSelection({ favorites, challenge, onFinalize }: { favorites: AnonymousSubmission[], challenge: ChallengeForWinners, onFinalize: (winners: { [key: number]: string }) => void }) {
    const [containers, setContainers] = useState<Containers>(() => ({
        candidates: favorites.filter(f => ![1, 2, 3].includes(f.position || 0)),
        place1: favorites.filter(f => f.position === 1),
        place2: favorites.filter(f => f.position === 2),
        place3: favorites.filter(f => f.position === 3),
    }));

    const [activeId, setActiveId] = useState<string | null>(null);
    const activeSubmission = activeId ? favorites.find(f => f.id === activeId) : null;

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    
    const winnerSlots = useMemo(() => {
        const slots: (1 | 2 | 3)[] = [];
        if (challenge.reward_first_place) slots.push(1);
        if (challenge.reward_second_place) slots.push(2);
        if (challenge.reward_third_place) slots.push(3);
        return slots;
    }, [challenge]);

    const findContainer = (id: string): ContainerId | undefined => {
        if (!id) return undefined;
        for (const key in containers) {
            if ((containers[key as ContainerId]).some(item => item.id === id)) {
                return key as ContainerId;
            }
        }
        return undefined;
    };
    
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        const activeContainer = findContainer(activeIdStr);
        let overContainer: ContainerId | undefined;

        if (overIdStr.startsWith('place-')) {
            overContainer = `place${overIdStr.split('-')[1]}` as ContainerId;
        } else {
            overContainer = findContainer(overIdStr) || 'candidates';
        }
        
        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            if (activeContainer === 'candidates' && activeIdStr !== overIdStr) {
                setContainers(prev => ({
                    ...prev,
                    candidates: arrayMove(prev.candidates, prev.candidates.findIndex(i => i.id === activeIdStr), prev.candidates.findIndex(i => i.id === overIdStr))
                }));
            }
            return;
        }
        
        if (activeContainer !== overContainer) {
            setContainers(prev => {
                const activeItems = [...prev[activeContainer]];
                const overItems = [...prev[overContainer]];
                const activeIndex = activeItems.findIndex(item => item.id === activeIdStr);
                const [movedItem] = activeItems.splice(activeIndex, 1);
                
                if (overContainer.startsWith('place') && overItems.length > 0) {
                    const [itemToSwap] = overItems.splice(0, 1);
                    const targetContainerForSwap = activeContainer.startsWith('place') ? activeContainer : 'candidates';
                    prev[targetContainerForSwap].push(itemToSwap);
                }
                
                overItems.push(movedItem);

                return {
                    ...prev,
                    [activeContainer]: activeItems,
                    [overContainer]: overItems,
                };
            });
        }
    };

    const handleFinalizeClick = () => {
        const winnerIds: { [key: number]: string } = {};
        winnerSlots.forEach(place => {
            const placeKey = `place${place}` as ContainerId;
            if (containers[placeKey] && containers[placeKey][0]) {
                winnerIds[place] = containers[placeKey][0].id;
            }
        });
        onFinalize(winnerIds);
    };

    const allSlotsFilled = winnerSlots.every(place => containers[`place${place}` as ContainerId]?.length > 0);

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-2xl">
                    <h4 className="font-bold text-center text-gray-700 mb-4">Favorité k umístění</h4>
                    <SortableContext items={containers.candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[100px]">
                            {containers.candidates.map(sub => <SortableSubmissionItem key={sub.id} submission={sub} />)}
                            {containers.candidates.length === 0 && <p className="text-center text-sm text-gray-500 pt-8">Všichni favorité jsou umístěni.</p>}
                        </div>
                    </SortableContext>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-4">
                    {winnerSlots.includes(1) && <WinnerDropzone place={1} submission={containers.place1[0] || null} />}
                    {winnerSlots.includes(2) && <WinnerDropzone place={2} submission={containers.place2[0] || null} />}
                    {winnerSlots.includes(3) && <WinnerDropzone place={3} submission={containers.place3[0] || null} />}
                </div>
            </div>
            
            <div className="text-center mt-10">
                <button 
                    onClick={handleFinalizeClick}
                    disabled={!allSlotsFilled}
                    className="px-8 py-4 rounded-full bg-green-600 text-white font-bold text-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {allSlotsFilled ? 'Vyhlásit výsledky a uzavřít výzvu' : `Obsaďte všechny pozice (${winnerSlots.length})`}
                </button>
            </div>

            <DragOverlay>
                {activeSubmission ? (
                    <SubmissionItem submission={activeSubmission} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}