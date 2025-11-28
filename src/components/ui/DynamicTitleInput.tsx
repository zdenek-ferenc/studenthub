"use client";

import { useState, useEffect } from 'react';
/* import { Plus, Trash2 } from 'lucide-react';
 */


type DynamicTitleInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function DynamicTitleInput({ value, onChange, placeholder }: DynamicTitleInputProps) {
    const [titles, setTitles] = useState<string[]>(() => {
        return value ? value.split(' ') : [''];
    });

    useEffect(() => {
        const combined = titles.filter(t => t.trim() !== '').join(' ');
        if (combined !== value) {
            onChange(combined);
        }
    }, [titles, onChange, value]);

    const handleInputChange = (index: number, newValue: string) => {
        const newTitles = [...titles];
        newTitles[index] = newValue;
        setTitles(newTitles);
    };

    const addTitle = () => {
        setTitles([...titles, '']);
    };

    const removeTitle = (index: number) => {
        const newTitles = titles.filter((_, i) => i !== index);
        setTitles(newTitles.length > 0 ? newTitles : ['']);
    };

    return (
        <div className="space-y-2">
            {titles.map((title, index) => (
                <div key={index} className="flex w-1/4 items-center">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={placeholder}
                        className="input !py-2 flex-grow"
                    />
                    
                    {titles.length > 1 || title.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => removeTitle(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Odstranit titul"
                        >
                            {/* <Trash2 size={18} /> */}
                        </button>
                    ) : (
                         <div></div>
                    )}

                    {/* {index === titles.length - 1 && (
                        <button
                            type="button"
                            onClick={addTitle}
                            className="p-2 text-[var(--barva-primarni)] hover:bg-blue-50 rounded-full transition-colors"
                            title="Přidat další titul"
                        >
                            <Plus size={20} />
                        </button>
                    )} */}
                </div>
            ))}
        </div>
    );
}
