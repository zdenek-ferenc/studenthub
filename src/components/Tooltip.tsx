"use client";

import React, { useId } from 'react';

type TooltipProps = {
    content: string;
    children: React.ReactNode;
    className?: string;
    alignment?: 'left' | 'center' | 'right';
};

export default function Tooltip({ content, children, className, alignment = 'center' }: TooltipProps) {
    const id = useId();

    const positionClasses = {
        left: 'left-0 bottom-full mb-4',
        center: 'left-1/2 -translate-x-1/2 bottom-full mb-4',
        right: 'right-0 bottom-full mb-4' 
    };

    return (
    <div className={`relative inline-block group ${className ?? ''}`} aria-describedby={id}>
        {children}
        <div
        id={id}
        role="tooltip"
        className={`z-90 pointer-events-none absolute ${positionClasses[alignment]} w-auto max-w-xs md:max-w-max md:w-max px-3 py-1.5 rounded-xl bg-[var(--barva-primarni)]/80 text-white text-xs shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 transition-all duration-150 whitespace-normal text-center`}
        >
        {content}
        </div>
    </div>
    );
}
