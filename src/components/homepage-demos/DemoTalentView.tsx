"use client";

import StudentCard from '../StudentCard'; 
import { mockStudentData1, mockStudentData2 } from './mock-data';
import { Search } from 'lucide-react';

export default function DemoTalentView() {
  return (
    <div className="p-4 rounded-lg max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Hledat talenty podle dovedností (např. 'React')..."
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-sm"
          disabled
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StudentCard 
          student={mockStudentData1} 
          demoStats={{ completed: 4, won: 1 }} 
        />
        <StudentCard 
          student={mockStudentData2} 
          demoStats={{ completed: 9, won: 3 }}
        />
      </div>
    </div>
  );
}