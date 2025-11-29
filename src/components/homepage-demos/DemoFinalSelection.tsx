"use client";

import { GripVertical, Check } from 'lucide-react';
import { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, useDraggable, useDroppable, DragOverlay, DragStartEvent, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

type Finalist = {
    id: string;
    name: string;
    rating: number;
};

const FinalistCard = ({ finalist, isOverlay = false, isDragging = false }: { finalist: Finalist, isOverlay?: boolean, isDragging?: boolean }) => (
    <div className={`
        p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between 
        ${isOverlay ? 'cursor-grabbing shadow-xl ring-2 ring-[var(--barva-primarni)] z-50' : 'cursor-grab hover:border-blue-500'}
        ${isDragging ? 'opacity-0' : 'opacity-100'}
    `}>
        <div className='flex flex-col'>
            <span className="font-medium text-sm">{finalist.name}</span>
            <span className="font-medium text-gray-500 text-xs">({finalist.rating}/10)</span>
        </div>
        <GripVertical className="text-gray-400" />
    </div>
);

const WinnerCard = ({ finalist, index, isOverlay = false, isDragging = false }: { finalist: Finalist, index: number, isOverlay?: boolean, isDragging?: boolean }) => (
    <div className={`
        p-3 bg-white rounded-lg border-2 border-amber-400 flex gap-1 items-center justify-between w-full
        ${isOverlay ? 'cursor-grabbing shadow-xl z-50' : 'cursor-grab hover:border-amber-500'}
        ${isDragging ? 'opacity-0' : 'opacity-100'}
    `}>
        <span className="font-medium text-sm">{index + 1}. místo: {finalist.name}</span>
        <Check className="text-green-500" />
    </div>
);

const DraggableFinalist = ({ finalist }: { finalist: Finalist }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: finalist.id,
        data: { type: 'finalist', item: finalist }
    });

    return (
        <div ref={setNodeRef} id={finalist.id} {...listeners} {...attributes} className="touch-none mb-3">
            <FinalistCard finalist={finalist} isDragging={isDragging} />
        </div>
    );
};

const DraggableWinner = ({ finalist, index }: { finalist: Finalist, index: number }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: finalist.id,
        data: { type: 'winner', item: finalist, index }
    });

    return (
        <div ref={setNodeRef} id={finalist.id} {...listeners} {...attributes} className="touch-none w-full">
            <WinnerCard finalist={finalist} index={index} isDragging={isDragging} />
        </div>
    );
};

const DroppableWinnerSlot = ({ index, winner, children }: { index: number, winner: Finalist | null, children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `winner-slot-${index}`,
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`
                rounded-lg transition-all duration-200 
                ${isOver ? 'bg-amber-100 border-amber-400 scale-[1.02]' : ''} 
                ${!winner ? 'h-12 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center' : ''}
            `}
        >
            {children}
        </div>
    );
}

const DroppableFinalistsList = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'finalists-list',
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`
                rounded-xl transition-colors p-2 -m-2 min-h-[200px]
                ${isOver ? 'bg-blue-50/50 ring-2 ring-blue-100' : ''}
            `}
        >
            <h4 className="block sm:hidden font-semibold text-gray-800 mb-3 ml-2">Finalisté</h4>
            <h4 className="hidden sm:block font-semibold text-gray-800 mb-3 ml-2">Finalisté k výběru</h4>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
};


const DemoFinalSelection = () => {
    const [finalists, setFinalists] = useState<Finalist[]>([
        { id: '2', name: 'Řešení #2', rating: 8 },
        { id: '3', name: 'Řešení #3', rating: 7 },
    ]);

    const [winners, setWinners] = useState<(Finalist | null)[]>([
        { id: '1', name: 'Řešení #1', rating: 9 },
        null,
        null,
    ]);

    const [activeDragItem, setActiveDragItem] = useState<{ item: Finalist, type: 'finalist' | 'winner', index?: number, width?: number } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current;
        const element = document.getElementById(active.id as string);
        
        if (data) {
            setActiveDragItem({
                item: data.item,
                type: data.type,
                index: data.index,
                width: element?.offsetWidth
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const isFromFinalists = finalists.find(f => f.id === activeId);
        const winnerSourceIndex = winners.findIndex(w => w?.id === activeId);
        const isFromWinners = winnerSourceIndex !== -1;

        const isToWinnerSlot = overId.startsWith('winner-slot-');
        const winnerTargetIndex = isToWinnerSlot ? parseInt(overId.replace('winner-slot-', '')) : -1;
        const isToFinalists = overId === 'finalists-list';        
        
        if (isFromFinalists && isToWinnerSlot) {
            const draggedItem = finalists.find(f => f.id === activeId)!;
            const existingWinner = winners[winnerTargetIndex];

            const newWinners = [...winners];
            newWinners[winnerTargetIndex] = draggedItem;

            const newFinalists = finalists.filter(f => f.id !== activeId);
            if (existingWinner) {
                newFinalists.push(existingWinner); 
            }

            setWinners(newWinners);
            setFinalists(newFinalists);
        }
        
        else if (isFromWinners && isToFinalists) {
            const draggedItem = winners[winnerSourceIndex]!;
            
            const newWinners = [...winners];
            newWinners[winnerSourceIndex] = null;

            setWinners(newWinners);
            setFinalists([...finalists, draggedItem]);
        }

        else if (isFromWinners && isToWinnerSlot) {
            if (winnerSourceIndex === winnerTargetIndex) return; 

            const newWinners = [...winners];
            const sourceItem = winners[winnerSourceIndex]!;
            const targetItem = winners[winnerTargetIndex];

            newWinners[winnerTargetIndex] = sourceItem;
            newWinners[winnerSourceIndex] = targetItem; 

            setWinners(newWinners);
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[snapCenterToCursor]}
        >
            <div className="grid grid-cols-2 gap-5 p-5 bg-gray-50 rounded-2xl shadow-xs border-2 border-gray-100 h-full">
                <DroppableFinalistsList>
                    {[...finalists].sort((a, b) => b.rating - a.rating).map(finalist => (
                        <DraggableFinalist key={finalist.id} finalist={finalist} />
                    ))}
                    {finalists.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            Všechna řešení umístěna
                        </div>
                    )}
                </DroppableFinalistsList>
                <div>
                    <h4 className="hidden sm:block font-semibold text-gray-800 mb-3">Vítězné pozice</h4>
                    <h4 className="sm:hidden font-semibold text-gray-800 mb-3">Vítězové</h4>
                    <div className="space-y-3">
                        {winners.map((winner, index) => (
                            <DroppableWinnerSlot key={`winner-slot-${index}`} index={index} winner={winner}>
                                {winner ? (
                                    <DraggableWinner finalist={winner} index={index} />
                                ) : (
                                    <span className="text-gray-500 text-sm">Přetáhni {index + 1}. místo</span>
                                )}
                            </DroppableWinnerSlot>
                        ))}
                    </div>
                </div>
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeDragItem ? (
                    <div style={{ width: activeDragItem.width }}>
                        {activeDragItem.type === 'finalist' ? (
                            <FinalistCard finalist={activeDragItem.item} isOverlay />
                        ) : (
                            <WinnerCard finalist={activeDragItem.item} index={activeDragItem.index || 0} isOverlay />
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default DemoFinalSelection;
